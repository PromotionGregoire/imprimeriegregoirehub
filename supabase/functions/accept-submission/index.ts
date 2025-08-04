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
      throw new Error('L\'ID de la soumission est requis');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Obtenir les détails de la soumission
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
      throw new Error('Soumission introuvable');
    }

    if (submission.status === 'Acceptée') {
      throw new Error('Cette soumission a déjà été acceptée');
    }

    // 2. Créer la commande
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
      console.error('Erreur lors de la création de la commande:', orderError);
      throw new Error('Impossible de créer la commande');
    }

    // 3. Attendre que le trigger crée l'épreuve
    await new Promise(resolve => setTimeout(resolve, 500));

    // 4. Mettre à jour le statut de la soumission
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ 
        status: 'Acceptée',
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Erreur lors de la mise à jour de la soumission:', updateError);
    }

    // 5. Récupérer l'épreuve créée
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
    console.error('Erreur dans la fonction accept-submission:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Une erreur inattendue s\'est produite'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});