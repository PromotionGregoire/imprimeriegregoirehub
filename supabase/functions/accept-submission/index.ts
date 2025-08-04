import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AcceptSubmissionRequest {
  submissionId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId }: AcceptSubmissionRequest = await req.json();
    
    if (!submissionId) {
      throw new Error('Submission ID is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get submission details
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        submission_items (*),
        clients (*)
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      throw new Error('Submission not found');
    }

    if (submission.status === 'Acceptée') {
      throw new Error('Cette soumission a déjà été acceptée');
    }

    // 2. Create the order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        submission_id: submissionId,
        client_id: submission.client_id,
        total_price: submission.total_price,
        status: 'En attente de l\'épreuve'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Impossible de créer la commande');
    }

    // 3. Wait for trigger to create proof
    await new Promise(resolve => setTimeout(resolve, 500));

    // 4. Update submission status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ 
        status: 'Acceptée',
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission:', updateError);
    }

    // 5. Get the created proof
    const { data: proof } = await supabase
      .from('proofs')
      .select('*')
      .eq('order_id', newOrder.id)
      .single();

    return new Response(
      JSON.stringify({ 
        success: true,
        order: newOrder,
        proof: proof,
        message: `Commande ${newOrder.order_number} créée avec succès`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in accept-submission function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});