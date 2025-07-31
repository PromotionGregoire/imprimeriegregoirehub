import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proofId } = await req.json();
    
    if (!proofId) {
      throw new Error('Proof ID is required');
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
        file_url,
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
      .eq('id', proofId)
      .single();

    if (proofError || !proof) {
      throw new Error('Proof not found');
    }

    if (!proof.file_url) {
      throw new Error('No file uploaded for this proof');
    }

    // Generate new approval token
    const newApprovalToken = crypto.randomUUID();

    // Update proof status and save approval token
    const { error: updateError } = await supabase
      .from('proofs')
      .update({
        status: 'Envoyée au client',
        approval_token: newApprovalToken,
        updated_at: new Date().toISOString()
      })
      .eq('id', proofId);

    if (updateError) {
      throw new Error('Failed to update proof status');
    }

    // Prepare email content
    const clientEmail = proof.orders?.clients?.email;
    const clientName = proof.orders?.clients?.contact_name;
    const businessName = proof.orders?.clients?.business_name;
    const orderNumber = proof.orders?.order_number;
    const approvalUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.lovableproject.com/approve/proof/${newApprovalToken}`;

    // Send email to client
    const emailResponse = await resend.emails.send({
      from: 'Promotion Grégoire <noreply@promotiongregoire.com>',
      to: [clientEmail!],
      subject: `Épreuve prête pour approbation - Commande ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Épreuve Prête pour Approbation
          </h1>
          
          <p>Bonjour ${clientName},</p>
          
          <p>Votre épreuve pour la commande <strong>${orderNumber}</strong> est maintenant prête pour votre révision et approbation.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #007bff;">Détails de la commande :</h3>
            <p><strong>Entreprise :</strong> ${businessName}</p>
            <p><strong>Numéro de commande :</strong> ${orderNumber}</p>
            <p><strong>Version de l'épreuve :</strong> V${proof.version}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${approvalUrl}" 
               style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Voir et Approuver l'Épreuve
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Sur la page d'approbation, vous pourrez :
          </p>
          <ul style="color: #666; font-size: 14px;">
            <li>Visualiser l'épreuve en haute qualité</li>
            <li>Télécharger le fichier pour révision</li>
            <li>Approuver l'épreuve pour production</li>
            <li>Demander des modifications si nécessaire</li>
          </ul>
          
          <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            Ce lien d'approbation est unique et sécurisé. Il expire automatiquement après utilisation.
            <br>Si vous avez des questions, n'hésitez pas à nous contacter.
          </p>
        </div>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    // Log activity
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        action_type: 'proof_sent',
        description: `L'épreuve V${proof.version} pour la commande ${orderNumber} a été envoyée au client.`,
        client_id: proof.orders?.client_id,
        metadata: {
          proof_id: proofId,
          order_id: proof.order_id,
          approval_token: newApprovalToken,
          client_email: clientEmail
        }
      });

    if (logError) {
      console.error('Failed to log activity:', logError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Proof sent to client successfully',
      approval_token: newApprovalToken
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-proof-to-client function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});