import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { Resend } from "https://esm.sh/resend@3.4.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const isEmail = (v?: string | null) =>
  !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { proofId } = await req.json();
    if (!proofId) return json({ error: "proofId requis" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 1. Charger preuve + client
    const { data: proof, error } = await supabase
      .from("proofs")
      .select(`
        id, version, file_url, approval_token, status,
        orders (
          order_number,
          submissions (
            clients ( business_name, contact_name, email )
          )
        )
      `)
      .eq("id", proofId)
      .maybeSingle();

    if (error) return json({ error: "Erreur DB (proof fetch)", detail: error.message }, 500);
    if (!proof) return json({ error: "Épreuve introuvable" }, 404);

    // --- après avoir récupéré `proof` (qui inclut orders -> submissions -> clients) ---
    const client = proof.orders?.submissions?.clients as
      | { contact_name?: string | null; business_name?: string | null; email?: string | null }
      | undefined;

    // Email: trim + lowercase pour éviter les rejets et incohérences
    const clientEmail = (client?.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return json({ error: "Client sans email valide" }, 400);
    }

    // Nom à afficher: contact_name > business_name > "Client"
    const clientName =
      (client?.contact_name && client?.contact_name.trim()) ||
      (client?.business_name && client?.business_name.trim()) ||
      "Client";

    // Base URL du portail (sélecteur ENV > défaut .com)
    const portalBase =
      (Deno.env.get("PUBLIC_PORTAL_BASE_URL") || "https://client.promotiongregoire.com").replace(/\/+$/, "");

    // Liens publics
    const proofVersion = `v${proof.version}`;
    const orderNumber = proof.orders.order_number;
    const approveUrl = `${portalBase}/epreuve/${encodeURIComponent(proof.approval_token)}`;
    const downloadUrl = proof.file_url;

    // Sujet + HTML stylé (comme votre maquette)
    const subject = `Épreuve ${orderNumber} – ${proofVersion}`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; padding:20px;">
  <div style="background:#f8f9fa; padding:30px; border-radius:8px; border-left:4px solid #5a7a51;">
    <h2 style="color:#5a7a51; margin:0 0 20px 0;">Votre épreuve est prête – ${proofVersion}</h2>
    <p>Bonjour ${clientName},</p>
    <p>Votre épreuve (BAT) pour la commande <strong>${orderNumber}</strong> est maintenant disponible pour validation.</p>
    <div style="margin:30px 0; text-align:center;">
      <a href="${approveUrl}"
         style="display:inline-block; padding:15px 30px; background-color:#5a7a51; color:#fff; text-decoration:none; border-radius:6px; font-weight:700; box-shadow:0 2px 4px rgba(0,0,0,.1);">
        📋 Consulter et approuver l'épreuve
      </a>
    </div>
    <p>Vous pouvez également télécharger directement le fichier :
       <a href="${downloadUrl}" style="color:#5a7a51; text-decoration:underline;">
         Télécharger l'épreuve (${proofVersion})
       </a>
    </p>
    <div style="margin-top:30px; padding-top:20px; border-top:1px solid #e9ecef; font-size:14px; color:#6c757d;">
      <p><strong>Imprimerie Grégoire</strong><br>
      Pour toute question, répondez simplement à ce message.<br>
      Nous sommes là pour vous accompagner ! 🎨</p>
    </div>
  </div>
</body></html>`;

    const text = `Bonjour ${clientName},

Votre épreuve (${proofVersion}) pour la commande ${orderNumber} est prête.

Voir et approuver / demander des modifications :
${approveUrl}

Télécharger l'épreuve (${proofVersion}) :
${downloadUrl}

— Imprimerie Grégoire`;

    // 2. Préparer envoi
    const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");
    const fromEmail = (Deno.env.get("RESEND_FROM_PROOFS") ?? "").trim();
    const replyTo = (Deno.env.get("RESEND_REPLY_TO") ?? "").trim();

    // 4. Envoi via Resend
    const sent = await resend.emails.send({
      from: `Imprimerie Grégoire <${fromEmail}>`,
      to: [clientEmail],
      reply_to: replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo) ? replyTo : undefined,
      subject,
      html,
      text,
    });

    if (sent?.error) {
      return json({ error: "Échec envoi email", details: sent.error }, 502);
    }

    // 5. Mise à jour statut
    await supabase
      .from("proofs")
      .update({ status: "Envoyée au client", updated_at: new Date().toISOString() })
      .eq("id", proof.id);

    return json({ ok: true, message: "Email envoyé", status: "Envoyée au client" });
  } catch (e) {
    console.error("send-proof-to-client fatal:", e);
    return json({ error: "Unexpected error", details: String(e) }, 500);
  }
});