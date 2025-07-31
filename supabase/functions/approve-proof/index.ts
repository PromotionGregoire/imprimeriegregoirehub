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
    const { approvalToken, approverName, confirmationWord } = await req.json();
    
    if (!approvalToken || !approverName || !confirmationWord) {
      throw new Error('Token d\'approbation, nom de l\'approbateur et mot de confirmation requis');
    }

    if (confirmationWord.toUpperCase() !== 'ACCEPTER') {
      throw new Error('Vous devez taper "ACCEPTER" pour confirmer l\'approbation');
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
          id,
          order_number,
          status as order_status,
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

    // Step 1: Update proof status to approved
    const { error: proofUpdateError } = await supabase
      .from('proofs')
      .update({
        status: 'Approuvée',
        approved_by_name: approverName,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', proof.id);

    if (proofUpdateError) {
      throw new Error('Erreur lors de l\'approbation de l\'épreuve');
    }

    // Step 2: Update order status to "En production"
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: 'En production',
        updated_at: new Date().toISOString()
      })
      .eq('id', proof.order_id);

    if (orderUpdateError) {
      throw new Error('Erreur lors de la mise à jour de la commande');
    }

    // Step 3: Log activities
    const orderNumber = proof.orders?.order_number;
    const clientId = proof.orders?.client_id;

    // Log proof approval
    const { error: proofLogError } = await supabase
      .from('activity_logs')
      .insert({
        action_type: 'proof_approved',
        description: `L'épreuve V${proof.version} pour la commande ${orderNumber} a été approuvée par ${approverName}.`,
        client_id: clientId,
        metadata: {
          proof_id: proof.id,
          order_id: proof.order_id,
          approver_name: approverName,
          approval_token: approvalToken
        }
      });

    // Log order status change
    const { error: orderLogError } = await supabase
      .from('activity_logs')
      .insert({
        action_type: 'order_status_changed',
        description: `La commande ${orderNumber} est passée en production suite à l'approbation de l'épreuve.`,
        client_id: clientId,
        metadata: {
          order_id: proof.order_id,
          proof_id: proof.id,
          new_status: 'En production',
          previous_status: proof.orders?.order_status
        }
      });

    if (proofLogError || orderLogError) {
      console.error('Failed to log activities:', { proofLogError, orderLogError });
    }

    // Step 4: Send email confirmations
    const businessName = proof.orders?.clients?.business_name;
    const clientEmail = proof.orders?.clients?.email;
    const contactName = proof.orders?.clients?.contact_name;

    // Email to client
    try {
      await resend.emails.send({
        from: 'Promotion Grégoire <info@promotiongregoire.com>',
        to: [clientEmail!],
        subject: `✅ Épreuve approuvée - Production démarrée pour ${orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
              ✅ Épreuve Approuvée !
            </h1>
            
            <p>Bonjour ${contactName},</p>
            
            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #10b981;">Excellente nouvelle !</h3>
              <p>Votre épreuve pour la commande <strong>${orderNumber}</strong> a été approuvée et la production a officiellement commencé.</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Détails de l'approbation :</h3>
              <p><strong>Entreprise :</strong> ${businessName}</p>
              <p><strong>Commande :</strong> ${orderNumber}</p>
              <p><strong>Épreuve :</strong> Version ${proof.version}</p>
              <p><strong>Approuvé par :</strong> ${approverName}</p>
              <p><strong>Statut :</strong> En production</p>
            </div>
            
            <h3 style="color: #333;">Prochaines étapes :</h3>
            <ul style="color: #666;">
              <li>Votre commande est maintenant en cours de production</li>
              <li>Vous recevrez une notification dès que la production sera terminée</li>
              <li>Notre équipe vous contactera pour la livraison/récupération</li>
            </ul>
            
            <p style="margin-top: 30px;">
              Merci de votre confiance ! Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
              Cette confirmation a été générée automatiquement suite à votre approbation.
              <br>Promotion Grégoire - Votre partenaire en impression et articles promotionnels
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send client confirmation email:', emailError);
    }

    // Email to internal team
    try {
      await resend.emails.send({
        from: 'Promotion Grégoire <info@promotiongregoire.com>',
        to: ['info@promotiongregoire.ca'],
        subject: `🚀 Production à démarrer - ${orderNumber} approuvée`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
              🚀 Production à Démarrer
            </h1>
            
            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>L'épreuve a été approuvée par le client !</strong></p>
              <p><strong>Client :</strong> ${businessName}</p>
              <p><strong>Commande :</strong> ${orderNumber}</p>
              <p><strong>Épreuve :</strong> Version ${proof.version}</p>
              <p><strong>Approuvé par :</strong> ${approverName}</p>
            </div>
            
            <h3 style="color: #10b981;">Actions à effectuer :</h3>
            <ul style="color: #333;">
              <li>✅ Statut de la commande mis à jour automatiquement</li>
              <li>📧 Email de confirmation envoyé au client</li>
              <li>🏭 <strong>Démarrer la production immédiatement</strong></li>
              <li>📋 Planifier le suivi de production</li>
            </ul>
            
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
      message: 'Épreuve approuvée avec succès',
      proofId: proof.id,
      orderNumber: orderNumber
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in approve-proof function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});