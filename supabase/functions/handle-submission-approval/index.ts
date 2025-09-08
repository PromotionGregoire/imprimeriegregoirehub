import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApprovalRequest {
  submission_id?: string;
  acceptance_token?: string; // <- support du lien public
  client_name?: string;      // optionnel (affiché en historique)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_id, acceptance_token, client_name }: ApprovalRequest = await req.json();

    if (!submission_id && !acceptance_token) {
      return new Response(
        JSON.stringify({ error: 'submission_id OR acceptance_token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // 1) Charger la soumission par id OU token public
    let subQuery = supabase
      .from('submissions')
      .select('id, status, client_id, total_price, submission_number')
      .limit(1);

    if (submission_id) subQuery = subQuery.eq('id', submission_id);
    else subQuery = subQuery.eq('acceptance_token', acceptance_token!);

    const { data: submissions, error: subErr } = await subQuery;
    if (subErr || !submissions || !submissions.length) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const submission = submissions[0];

    // 2) Valider le statut (robuste aux anciennes valeurs)
    const okStatuses = new Set([
      "En attente d'approbation", "pending", "Pending", "PENDING", "Envoyée", "Envoyee", "sent", "SENT"
    ]);
    if (!okStatuses.has((submission.status || '').trim())) {
      return new Response(JSON.stringify({
        error: 'Invalid submission status for approval',
        current_status: submission.status
      }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    // 3) Marquer la soumission approuvée (FR)
    {
      const { error: updErr } = await supabase
        .from('submissions')
        .update({ status: 'Approuvée', updated_at: new Date().toISOString() })
        .eq('id', submission.id);
      if (updErr) {
        return new Response(JSON.stringify({ error: 'Failed to approve submission' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // 4) Récupérer ou créer la commande
    let order_id: string | null = null;
    let order_number: string | null = null;

    {
      const { data: existing } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('submission_id', submission.id)
        .maybeSingle();

      if (existing) {
        order_id = existing.id;
        order_number = existing.order_number;
      } else {
        const { data: newOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            submission_id: submission.id,
            client_id: submission.client_id,
            total_price: submission.total_price || 0,
            status: "En attente de l'épreuve",  // statut FR demandé
          })
          .select('id, order_number')
          .single();

        if (orderErr || !newOrder) {
          return new Response(JSON.stringify({ error: 'Failed to create order' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        order_id = newOrder.id;
        order_number = newOrder.order_number;
      }
    }

    // 5) Créer la proof v1 si aucune n'existe encore
    let proof_id: string | null = null;
    {
      const { data: anyProof } = await supabase
        .from('proofs')
        .select('id, version')
        .eq('order_id', order_id!)
        .order('version', { ascending: false })
        .limit(1);

      if (!anyProof || !anyProof.length) {
        const payload = {
          order_id: order_id!,
          version: 1,
          status: 'En préparation',   // cohérent avec ton UI
          is_active: true,
          approval_token: crypto.randomUUID(),
          validation_token: crypto.randomUUID(),
          updated_at: new Date().toISOString(),
        };

        const { data: newProof, error: proofErr } = await supabase
          .from('proofs')
          .insert(payload)
          .select('id')
          .single();

        if (proofErr || !newProof) {
          return new Response(JSON.stringify({ error: 'Failed to create initial proof' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        proof_id = newProof.id;
      }
    }

    // 6) (optionnel) Historiser
    try {
      await supabase.rpc('add_ordre_history', {
        p_order_id: order_id!,
        p_action_type: 'submission_approved',
        p_action_description: `Soumission ${submission.submission_number} approuvée` + (client_name ? ` par ${client_name}` : ''),
        p_client_action: true
      });
    } catch (_e) { /* best effort */ }

    return new Response(
      JSON.stringify({ order_id, order_number, proof_id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (e) {
    console.error('handle-submission-approval error', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});