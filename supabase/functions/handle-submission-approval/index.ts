import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApprovalRequest {
  submission_id: string;
  client_id?: string;
}

interface ApprovalResponse {
  order_id: string;
  order_number: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_id }: ApprovalRequest = await req.json();
    
    if (!submission_id) {
      return new Response(
        JSON.stringify({ error: 'submission_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Fetch and validate submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('id, status, client_id, total_price, deadline')
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      console.error('Submission not found:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Submission not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (submission.status !== 'En attente d\'approbation') {
      return new Response(
        JSON.stringify({ error: 'Invalid submission status for approval' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update submission status to approved
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ 
        status: 'Approuvée',
        updated_at: new Date().toISOString()
      })
      .eq('id', submission_id);

    if (updateError) {
      console.error('Error updating submission status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to approve submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('submission_id', submission_id)
      .maybeSingle();

    let order_id = existingOrder?.id;
    let order_number = existingOrder?.order_number;

    // Create order if it doesn't exist
    if (!existingOrder) {
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          submission_id,
          client_id: submission.client_id,
          total_price: submission.total_price || 0,
          status: 'En attente de l\'épreuve',
        })
        .select('id, order_number')
        .single();

      if (orderError || !newOrder) {
        console.error('Error creating order:', orderError);
        return new Response(
          JSON.stringify({ error: 'Failed to create order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      order_id = newOrder.id;
      order_number = newOrder.order_number;
    }

    const response: ApprovalResponse = {
      order_id: order_id!,
      order_number: order_number!,
    };

    console.log(`Successfully approved submission ${submission_id}, created/found order ${order_number}`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in handle-submission-approval:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});