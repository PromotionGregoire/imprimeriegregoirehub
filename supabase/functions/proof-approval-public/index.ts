import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Req {
  approval_token: string;
  decision: 'approve' | 'reject';
  comments?: string;
  approved_by_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { approval_token, decision, comments, approved_by_name }: Req = await req.json();

    if (!approval_token || !decision) {
      return new Response(JSON.stringify({ error: 'approval_token and decision are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // 1) Récupérer la proof
    const { data: proofs, error: pErr } = await supabase
      .from('proofs')
      .select('id, order_id, status, version')
      .eq('approval_token', approval_token)
      .limit(1);

    if (pErr || !proofs || !proofs.length) {
      return new Response(JSON.stringify({ error: 'Proof not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }
    const proof = proofs[0];

    // 2) Mettre à jour la proof
    const isApprove = decision === 'approve';
    const newStatus = isApprove ? 'Approuvée' : 'Rejetée';

    const { error: updErr } = await supabase
      .from('proofs')
      .update({
        status: newStatus,
        approved_at: isApprove ? new Date().toISOString() : null,
        approved_by_name: isApprove ? (approved_by_name || 'Client') : null,
        client_comments: comments || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', proof.id);

    if (updErr) {
      return new Response(JSON.stringify({ error: 'Failed to update proof status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    // 3) Mettre à jour le statut de la commande si approuvée
    if (isApprove) {
      await supabase
        .from('orders')
        .update({ status: 'Épreuve acceptée', updated_at: new Date().toISOString() })
        .eq('id', proof.order_id);
    }

    // 4) Historiser (best effort)
    try {
      await supabase.rpc('add_ordre_history', {
        p_order_id: proof.order_id,
        p_proof_id: proof.id,
        p_action_type: isApprove ? 'proof_approved' : 'proof_rejected',
        p_action_description: isApprove
          ? `BAT v${proof.version} approuvé`
          : `BAT v${proof.version} rejeté`,
        p_client_action: true,
        p_metadata: comments ? { comments } : null,
      });
    } catch (_e) {}

    return new Response(JSON.stringify({ status: newStatus }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e) {
    console.error('proof-approval-public error', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});