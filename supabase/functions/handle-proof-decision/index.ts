import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Decision = "approved" | "rejected";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const token: string | undefined = body?.token;
    const decision: Decision | undefined = body?.decision;
    const comments: string | undefined = body?.comments;
    const clientNameInput: string | undefined = body?.clientName; // facultatif

    if (!token || !decision) {
      return json({ error: "Token et décision sont requis" }, 400);
    }
    if (!["approved", "rejected"].includes(decision)) {
      return json({ error: 'Décision invalide. Utilisez "approved" ou "rejected".' }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 🔎 IMPORTANT: on cherche par APPROVAL_TOKEN (pas validation_token)
    const { data: proof, error: proofErr } = await supabase
      .from("proofs")
      .select(`
        id,
        order_id,
        status,
        version,
        approval_token,
        orders (
          id,
          order_number,
          submissions (
            submission_number,
            clients (
              business_name,
              contact_name,
              email
            )
          )
        )
      `)
      .eq("approval_token", token)
      .maybeSingle();

    if (proofErr) {
      console.error("Error fetching proof:", proofErr);
      return json({ error: "Erreur lors de la recherche de l'épreuve" }, 500);
    }
    if (!proof) {
      console.log("Proof not found for approval_token:", token);
      return json({ error: "Épreuve non trouvée ou token invalide" }, 404);
    }

    // 👤 Déduction automatique du nom du client si non fourni
    const derivedClientName =
      (clientNameInput && clientNameInput.trim()) ||
      proof.orders?.submissions?.clients?.contact_name ||
      proof.orders?.submissions?.clients?.business_name ||
      "Client";

    if (decision === "approved") {
      const { error: upErr } = await supabase
        .from("proofs")
        .update({
          status: "Approuvée",
          approved_by_name: derivedClientName,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", proof.id);

      if (upErr) {
        console.error("Error updating proof (approve):", upErr);
        return json({ error: "Erreur lors de la mise à jour de l'épreuve" }, 500);
      }

      // Historique (best-effort)
      const { error: histApproveErr } = await supabase.rpc("add_ordre_history", {
        p_order_id: proof.order_id,
        p_action_type: "approbation_epreuve",
        p_action_description: `Épreuve v${proof.version} approuvée par ${derivedClientName}`,
        p_metadata: {
          proof_id: proof.id,
          version: proof.version,
          approved_by: derivedClientName,
          approved_at: new Date().toISOString(),
        },
        p_proof_id: proof.id,
        p_client_action: true,
      });
      if (histApproveErr) {
        console.warn("History RPC failed (approve):", histApproveErr.message || histApproveErr);
      }

      return json({
        success: true,
        message: "Épreuve approuvée avec succès. La commande est prête pour production.",
        proof_status: "Approuvée",
      });
    }

    // decision === "rejected"
    if (!comments || !comments.trim()) {
      return json({ error: "Les commentaires sont requis pour refuser l'épreuve" }, 400);
    }

    const cleanComments = comments.trim();

    const { error: rejErr } = await supabase
      .from("proofs")
      .update({
        status: "Modification demandée",
        client_comments: cleanComments,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proof.id);

    if (rejErr) {
      console.error("Error updating proof (reject):", rejErr);
      return json({ error: "Erreur lors de la mise à jour de l'épreuve" }, 500);
    }

    // 💬 Table des commentaires — colonne correcte: comment_text
    const { error: commentErr } = await supabase
      .from("epreuve_commentaires")
      .insert({
        proof_id: proof.id,
        order_id: proof.order_id,
        comment_text: cleanComments,
        client_name: derivedClientName,
        created_by_client: true,
        is_modification_request: true,
      });
    if (commentErr) {
      console.warn("Comment insert failed:", commentErr.message || commentErr);
    }

    // Historique (best-effort)
    const { error: histRejectErr } = await supabase.rpc("add_ordre_history", {
      p_order_id: proof.order_id,
      p_action_type: "demande_modification_epreuve",
      p_action_description: `Modifications demandées par ${derivedClientName} (v${proof.version})`,
      p_metadata: {
        proof_id: proof.id,
        version: proof.version,
        client_name: derivedClientName,
        comments: cleanComments,
      },
      p_proof_id: proof.id,
      p_client_action: true,
    });
    if (histRejectErr) {
      console.warn("History RPC failed (reject):", histRejectErr.message || histRejectErr);
    }

    return json({
      success: true,
      message:
        "Demande de modification envoyée avec succès. Nous vous enverrons une nouvelle épreuve sous peu.",
      proof_status: "Modification demandée",
    });
  } catch (error) {
    console.error("Unexpected error in handle-proof-decision:", error);
    return json({ error: "Erreur interne du serveur" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}