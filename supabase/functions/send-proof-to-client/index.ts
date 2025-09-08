import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendProofRequest {
  proofId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proofId }: SendProofRequest = await req.json();

    if (!proofId) {
      throw new Error('proofId is required');
    }

    // Initialize clients
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get proof details with client information
    const { data: proof, error: proofError } = await supabase
      .from('proofs')
      .select(`
        id,
        version,
        status,
        file_url,
        approval_token,
        order_id,
        orders!inner(
          order_number,
          submissions!inner(
            submission_number,
            clients!inner(
              business_name,
              contact_name,
              email
            )
          )
        )
      `)
      .eq('id', proofId)
      .single();

    if (proofError || !proof) {
      console.error('Proof fetch error:', proofError);
      throw new Error('Proof not found');
    }

    // Extract client information
    const client = proof.orders.submissions.clients;
    const order = proof.orders;
    const submission = proof.orders.submissions;

    if (!client.email) {
      throw new Error('Client email not found');
    }

    if (!proof.file_url) {
      throw new Error('Proof file not uploaded yet');
    }

    // Generate approval token if missing
    let approvalToken = proof.approval_token;
    if (!approvalToken) {
      approvalToken = crypto.randomUUID();
      
      const { error: updateError } = await supabase
        .from('proofs')
        .update({ 
          approval_token: approvalToken,
          updated_at: new Date().toISOString()
        })
        .eq('id', proofId);

      if (updateError) {
        console.error('Token update error:', updateError);
        throw new Error('Failed to generate approval token');
      }
    }

    // Update proof status to "Envoyée au client"
    const { error: statusError } = await supabase
      .from('proofs')
      .update({ 
        status: 'Envoyée au client',
        updated_at: new Date().toISOString()
      })
      .eq('id', proofId);

    if (statusError) {
      console.error('Status update error:', statusError);
      throw new Error('Failed to update proof status');
    }

    // Build approval URL
    const baseUrl = Deno.env.get('PUBLIC_PORTAL_BASE_URL') || 'https://hub.promotiongregoire.com';
    const approvalUrl = `${baseUrl}/approve/proof/${approvalToken}`;

    // Email content
    const subject = `Épreuve v${proof.version} – Commande ${order.order_number} – ${client.business_name}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; border-left: 4px solid #5a7a51;">
          <h2 style="color: #5a7a51; margin: 0 0 20px 0;">Votre épreuve est prête – Version ${proof.version}</h2>
          
          <p>Bonjour ${client.contact_name || 'Cher client'},</p>
          
          <p>Votre épreuve (BAT) pour la commande <strong>${order.order_number}</strong> est maintenant disponible pour validation.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${approvalUrl}" 
               style="display: inline-block; 
                      padding: 15px 30px; 
                      background-color: #5a7a51; 
                      color: white; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: bold;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              📋 Consulter et approuver l'épreuve
            </a>
          </div>
          
          <p>Vous pouvez également télécharger directement le fichier : 
             <a href="${proof.file_url}" style="color: #5a7a51; text-decoration: underline;">
               Télécharger l'épreuve (v${proof.version})
             </a>
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #6c757d;">
            <p><strong>Imprimerie Grégoire</strong><br>
               Pour toute question, répondez simplement à ce message.<br>
               Nous sommes là pour vous accompagner ! 🎨</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResult = await resend.emails.send({
      from: Deno.env.get('RESEND_FROM_PROOFS') || 'Imprimerie Grégoire <noreply@promotiongregoire.com>',
      to: [client.email],
      reply_to: Deno.env.get('RESEND_REPLY_TO') || 'production@promotiongregoire.com',
      subject,
      html,
    });

    if (emailResult.error) {
      console.error('Email send error:', emailResult.error);
      throw new Error(`Failed to send email: ${emailResult.error.message}`);
    }

    // Log the email notification
    await supabase.from('email_notifications').insert({
      email_type: 'proof_notification',
      proof_id: proofId,
      recipient_email: client.email,
      sent_at: new Date().toISOString(),
      success: true,
    });

    console.log('Proof notification sent successfully:', emailResult.data?.id);

    return new Response(JSON.stringify({ 
      sent: true, 
      email_id: emailResult.data?.id,
      approval_url: approvalUrl
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
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});