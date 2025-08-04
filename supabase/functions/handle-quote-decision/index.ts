import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteDecisionRequest {
  token: string;
  decision: 'approved' | 'declined';
  comments: string;
  clientName?: string;
  clientEmail?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token, decision, comments, clientName, clientEmail }: QuoteDecisionRequest = await req.json();

    console.log(`Processing quote decision: ${decision} for token: ${token}`);

    if (!token || !decision || !comments?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Token, décision et commentaires sont requis' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Récupérer la soumission avec le token d'approbation
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        id,
        submission_number,
        status,
        client_id,
        clients (
          business_name,
          contact_name,
          email
        )
      `)
      .eq('approval_token', token)
      .maybeSingle();

    if (submissionError) {
      console.error('Erreur lors de la récupération de la soumission:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la récupération de la soumission' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!submission) {
      console.error('Soumission non trouvée pour le token:', token);
      return new Response(
        JSON.stringify({ error: 'Soumission non trouvée ou token invalide' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Déterminer le nouveau statut
    const newStatus = decision === 'approved' ? 'Acceptée' : 'Refusée';
    const approvedBy = clientName || submission.clients?.contact_name || 'Client';

    console.log(`Mise à jour du statut de ${submission.submission_number} vers: ${newStatus}`);

    // Mettre à jour la soumission
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        status: newStatus,
        approved_by: approvedBy,
        modification_request_notes: decision === 'declined' ? comments : null
      })
      .eq('id', submission.id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la mise à jour de la soumission' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Logger l'action dans l'historique si la soumission a des commandes
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('submission_id', submission.id);

    if (orders && orders.length > 0) {
      for (const order of orders) {
        const actionDescription = decision === 'approved' 
          ? `Devis approuvé par ${approvedBy}` 
          : `Devis refusé par ${approvedBy}`;

        await supabase.rpc('add_ordre_history', {
          p_order_id: order.id,
          p_action_type: decision === 'approved' ? 'approve_devis' : 'reject_devis',
          p_action_description: actionDescription,
          p_metadata: {
            decision,
            comments,
            approvedBy,
            submissionNumber: submission.submission_number,
            timestamp: new Date().toISOString()
          },
          p_client_action: true,
          p_created_by: null
        });
      }
    }

    console.log(`Soumission ${submission.submission_number} mise à jour avec succès`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Soumission ${decision === 'approved' ? 'approuvée' : 'refusée'} avec succès`,
        submissionNumber: submission.submission_number,
        newStatus
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erreur dans handle-quote-decision:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});