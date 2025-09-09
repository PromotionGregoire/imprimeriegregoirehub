import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProofDecisionRequest {
  token: string;
  decision: 'approved' | 'rejected';
  clientName?: string;
  comments?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, decision, clientName, comments }: ProofDecisionRequest = await req.json();

    console.log('Processing proof decision:', { token, decision, clientName: clientName || 'N/A' });

    if (!token || !decision) {
      return new Response(
        JSON.stringify({ error: 'Token et décision sont requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client with service role for full access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, find the proof by validation_token
    const { data: proofData, error: proofError } = await supabase
      .from('proofs')
      .select(`
        id,
        order_id,
        status,
        version,
        orders (
          id,
          order_number,
          status,
          submission_id,
          submissions (
            id,
            submission_number,
            clients (
              id,
              business_name,
              contact_name,
              email
            )
          )
        )
      `)
      .eq('validation_token', token)
      .eq('is_active', true)
      .maybeSingle();

    if (proofError) {
      console.error('Error fetching proof:', proofError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la recherche de l\'épreuve' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!proofData) {
      console.log('Proof not found for token:', token);
      return new Response(
        JSON.stringify({ error: 'Épreuve non trouvée ou token invalide' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Found proof:', proofData.id, 'for order:', proofData.order_id);

    if (decision === 'approved') {
      console.log('Processing approval...');
      
      if (!clientName?.trim()) {
        return new Response(
          JSON.stringify({ error: 'Le nom du client est requis pour l\'approbation' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Update proof status to approved
      const { error: updateProofError } = await supabase
        .from('proofs')
        .update({
          status: 'Approuvée',
          approved_by_name: clientName.trim(),
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', proofData.id);

      if (updateProofError) {
        console.error('Error updating proof status:', updateProofError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la mise à jour de l\'épreuve' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Le statut de la commande sera automatiquement mis à jour par le trigger
      // sync_order_status_from_proof() quand l'épreuve passe à "Approuvée"

      // Add history entry for approval
      const { error: historyError } = await supabase
        .rpc('add_ordre_history', {
          p_order_id: proofData.order_id,
          p_action_type: 'approbation_epreuve',
          p_action_description: `Épreuve version ${proofData.version} approuvée par ${clientName.trim()}`,
          p_metadata: {
            proof_id: proofData.id,
            version: proofData.version,
            approved_by: clientName.trim(),
            approved_at: new Date().toISOString()
          },
          p_proof_id: proofData.id,
          p_client_action: true
        });

      if (historyError) {
        console.error('Error adding history entry:', historyError);
        // Don't fail the request for history errors
      }

      console.log('Proof approved successfully');
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Épreuve approuvée avec succès. La commande est prête pour production.',
          proof_status: 'Approuvée',
          order_status: 'Épreuve acceptée'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else if (decision === 'rejected') {
      console.log('Processing rejection...');
      
      if (!clientName?.trim() || !comments?.trim()) {
        return new Response(
          JSON.stringify({ error: 'Le nom du client et les commentaires sont requis pour la demande de modification' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Update proof status to modification requested
      const { error: updateProofError } = await supabase
        .from('proofs')
        .update({
          status: 'Modification demandée',
          client_comments: comments.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', proofData.id);

      if (updateProofError) {
        console.error('Error updating proof status:', updateProofError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la mise à jour de l\'épreuve' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Add comment to epreuve_commentaires table
      const { error: commentError } = await supabase
        .from('epreuve_commentaires')
        .insert({
          proof_id: proofData.id,
          order_id: proofData.order_id,
          commentaire: comments.trim(),
          client_name: clientName.trim(),
          created_by_client: true,
          is_modification_request: true
        });

      if (commentError) {
        console.error('Error adding comment:', commentError);
        // Don't fail the request for comment errors
      }

      // Add history entry for modification request
      const { error: historyError } = await supabase
        .rpc('add_ordre_history', {
          p_order_id: proofData.order_id,
          p_action_type: 'demande_modification_epreuve',
          p_action_description: `Modification demandée par ${clientName.trim()} pour l'épreuve version ${proofData.version}`,
          p_metadata: {
            proof_id: proofData.id,
            version: proofData.version,
            client_name: clientName.trim(),
            comments: comments.trim()
          },
          p_proof_id: proofData.id,
          p_client_action: true
        });

      if (historyError) {
        console.error('Error adding history entry:', historyError);
        // Don't fail the request for history errors
      }

      console.log('Modification request processed successfully');
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Demande de modification envoyée avec succès. Nous vous enverrons une nouvelle épreuve sous peu.',
          proof_status: 'Modification demandée'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Décision invalide. Utilisez "approved" ou "rejected".' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Unexpected error in handle-proof-decision:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});