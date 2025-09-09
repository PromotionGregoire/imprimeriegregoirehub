import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { Resend } from "https://esm.sh/resend@3.4.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const isEmail = (v?: string | null) =>
  !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { proofId } = await req.json();

    if (!proofId) {
      return json({ error: "proofId requis" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Récupère preuve + commande + client
    const { data: proof, error } = await supabase
      .from("proofs")
      .select(`
        id, version, file_url, approval_token, status, order_id,
        orders (
          id, order_number,
          submissions (
            submission_number,
            clients ( business_name, contact_name, email )
          )
        )
      `)
      .eq("id", proofId)
      .maybeSingle();

    if (error) return json({ error: "Erreur DB (proof fetch)" }, 500);
    if (!proof) return json({ error: "Épreuve introuvable" }, 404);

    const clientEmail = proof.orders?.submissions?.clients?.email;
    const clientName =
      proof.orders?.submissions?.clients?.contact_name ||
      proof.orders?.submissions?.clients?.business_name ||
      "Client";

    if (!isEmail(clientEmail)) {
      return json({ error: "Client sans email valide" }, 400);
    }

    // Prépare envoi Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");
    const fromSecret = (Deno.env.get("RESEND_FROM_PROOFS") ?? "").trim();
    const replyToSecret = (Deno.env.get("RESEND_REPLY_TO") ?? "").trim();

    // normalisation
    const fromEmail = (fromSecret.match(/<([^>]+)>/)?.[1] || fromSecret).trim();
    const replyTo = isEmail(replyToSecret) ? replyToSecret : undefined;

    const displayName = "Imprimerie Grégoire";
    const formattedFrom = isEmail(fromEmail)
      ? `${displayName} <${fromEmail}>`
      : `${displayName} <onboarding@resend.dev>`; // fallback sécure

    const subject = `Épreuve ${proof.orders ? proof.orders.order_number : ""} – version v${proof.version}`;
    const approveUrl = `${Deno.env.get("PUBLIC_PORTAL_BASE_URL")}/approval?token=${encodeURIComponent(
      proof.approval_token
    )}`;

    const html = `
      <p>Bonjour ${clientName},</p>
      <p>Voici votre épreuve (v${proof.version}).</p>
      <p><a href="${approveUrl}">Voir et approuver / demander des modifications</a></p>
    `;

    // ENVOI EMAIL en premier
    let sent = await resend.emails.send({
      from: formattedFrom,
      to: [clientEmail!],
      reply_to: replyTo,
      subject,
      html,
    });

    // Si échec → log détaillé et fallback onboarding
    if (sent?.error) {
      console.warn("Resend primary failed:", {
        name: sent.error.name,
        message: sent.error.message,
        type: (sent as any).error?.type,
      });

      // Fallback si le from n'est pas accepté (domaine non vérifié, etc.)
      sent = await resend.emails.send({
        from: `${displayName} <onboarding@resend.dev>`,
        to: [clientEmail!],
        reply_to: replyTo,
        subject: `[TEST] ${subject}`,
        html,
      });

      if (sent?.error) {
        // On renvoie l'erreur lisible au client
        return json(
          {
            error: "Failed to send email",
            details: {
              name: sent.error.name,
              message: sent.error.message,
            },
          },
          502
        );
      }
    }

    // EMAIL OK → on met à jour le statut
    const { error: upErr } = await supabase
      .from("proofs")
      .update({
        status: "Envoyée au client",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proof.id);

    if (upErr) {
      console.warn("Proof status update after email failed:", upErr);
    }

    // Log notification (best-effort)
    try {
      await supabase
        .from("email_notifications")
        .insert({
          proof_id: proof.id,
          email_type: "proof_notification",
          recipient_email: clientEmail,
          success: true,
        });
    } catch (error) {
      console.warn("Failed to log email notification:", error);
    }

    return json({ ok: true, messageId: sent?.data?.id ?? null });
  } catch (e) {
    console.error("send-proof-to-client fatal:", e);
    return json({ error: "Unexpected error", details: String(e?.message ?? e) }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}