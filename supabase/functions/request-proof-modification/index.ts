import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend("re_BrRp9Dq5_PruGei5d4TM1dxkFNCzNTDzo");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { approvalToken, clientComments, clientName } = await req.json();
    
    if (!approvalToken || !clientComments || !clientName) {
      throw new Error('Token d\'approbation, commentaires et nom du client requis');
    }

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get proof details with order and client information
    const { data: proof, error: proofError } = await supabase
      .from('proofs')
      .select(`
        id,
        version,
        status,
        order_id,
        orders!fk_proofs_order_id (
          order_number,
          client_id,
          clients (
            business_name,
            contact_name,
            email
          )
        )
      `)
      .eq('approval_token', approvalToken)
      .single();

    if (proofError || !proof) {
      throw new Error('Épreuve non trouvée ou token invalide');
    }

    if (proof.status === 'Approuvée') {
      throw new Error('Cette épreuve a déjà été approuvée');
    }

    if (proof.status === 'Modification demandée') {
      throw new Error('Une modification a déjà été demandée pour cette épreuve');
    }

    // Update proof status and save client comments
    const { error: updateError } = await supabase
      .from('proofs')
      .update({
        status: 'Modification demandée',
        client_comments: clientComments,
        updated_at: new Date().toISOString()
      })
      .eq('id', proof.id);

    if (updateError) {
      throw new Error('Erreur lors de la mise à jour de l\'épreuve');
    }

    // Log activity
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        action_type: 'proof_modification_requested',
        description: `Le client a demandé une modification pour l'épreuve V${proof.version} de la commande ${proof.orders?.order_number}.`,
        client_id: proof.orders?.client_id,
        metadata: {
          proof_id: proof.id,
          order_id: proof.order_id,
          client_name: clientName,
          client_comments: clientComments,
          approval_token: approvalToken
        }
      });

    if (logError) {
      console.error('Failed to log activity:', logError);
    }

    // Send notification email to internal team
    const orderNumber = proof.orders?.order_number;
    const businessName = proof.orders?.clients?.business_name;
    
    try {
      await resend.emails.send({
        from: 'Promotion Grégoire <onboarding@resend.dev>',
        to: ['info@promotiongregoire.ca'],
        subject: `🔄 Modification demandée - Épreuve ${orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
              🔄 Modification Demandée
            </h1>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Client :</strong> ${businessName}</p>
              <p><strong>Commande :</strong> ${orderNumber}</p>
              <p><strong>Épreuve :</strong> Version ${proof.version}</p>
              <p><strong>Demandé par :</strong> ${clientName}</p>
            </div>
            
            <h3 style="color: #f59e0b;">Commentaires du client :</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; white-space: pre-wrap;">${clientComments}</p>
            </div>
            
            <p style="margin-top: 20px;">
              <strong>Action requise :</strong> Veuillez réviser les commentaires du client et préparer une nouvelle version de l'épreuve.
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              Cette notification a été générée automatiquement par le système de gestion des épreuves.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send internal notification email:', emailError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Demande de modification enregistrée avec succès',
      proofId: proof.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in request-proof-modification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});