import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApprovalRequest { submission_id: string }
interface ApprovalResponse { order_id: string; order_number: string; proof_id?: string }

function hex32() {
  // 16 bytes -> 32 hex chars
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return Array.from(buf).map(b => b.toString(16).padStart(2,'0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_id }: ApprovalRequest = await req.json();
    if (!submission_id) {
      return new Response(JSON.stringify({ error: 'submission_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('id, status, client_id, total_price, submission_number')
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      console.error('Submission not found:', submissionError);
      return new Response(JSON.stringify({ error: 'Submission not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const PENDING = new Set([
      "En attente d'approbation",
      "En attente d'approbation",
      "Envoyée",
      "Envoyee",
      "pending", "Pending", "PENDING"
    ]);

    if (!PENDING.has(submission.status)) {
      if (submission.status === 'Approuvée') {
        // Already approved -> return existing or create order and proof if missing
      } else {
        console.warn('Invalid status for approval:', submission.status);
        return new Response(JSON.stringify({
          error: 'Invalid submission status for approval',
          status: submission.status,
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Approve the submission
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ status: 'Approuvée', updated_at: new Date().toISOString() })
        .eq('id', submission_id);

      if (updateError) {
        console.error('Error updating submission status:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to approve submission' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Find or create order
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('submission_id', submission_id)
      .maybeSingle();

    let order_id = existingOrder?.id;
    let order_number = existingOrder?.order_number;

    if (!existingOrder) {
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          submission_id,
          client_id: submission.client_id,
          total_price: submission.total_price || 0,
          status: "En attente de l'épreuve",
        })
        .select('id, order_number')
        .single();

      if (orderError || !newOrder) {
        console.error('Error creating order:', orderError);
        return new Response(JSON.stringify({ error: 'Failed to create order' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      order_id = newOrder.id;
      order_number = newOrder.order_number;
    }

    // Ensure at least one proof exists
    const { data: hasProof } = await supabase
      .from('proofs')
      .select('id')
      .eq('order_id', order_id!)
      .limit(1);

    let createdProofId: string | undefined = hasProof?.[0]?.id;

    if (!createdProofId) {
      // Get next version
      let nextVersion = 1;
      const { data: rpcVer } = await supabase.rpc('get_next_proof_version', { p_order_id: order_id! });
      if (typeof rpcVer === 'number' && rpcVer > 0) nextVersion = rpcVer;

      const { data: proof, error: proofError } = await supabase
        .from('proofs')
        .insert({
          order_id: order_id!,
          version: nextVersion,
          status: 'pending',
          is_active: true,
          approval_token: hex32(),
          validation_token: hex32(),
        })
        .select('id')
        .single();

      if (proofError || !proof) {
        console.error('Error creating initial proof:', proofError);
        return new Response(JSON.stringify({ error: 'Failed to create initial proof' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      createdProofId = proof.id;
    }

    const response: ApprovalResponse = {
      order_id: order_id!,
      order_number: order_number!,
      proof_id: createdProofId
    };

    console.log(`Submission ${submission.submission_number} approved -> Order ${order_number} (proof ${createdProofId})`);

    return new Response(JSON.stringify(response), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in handle-submission-approval:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});