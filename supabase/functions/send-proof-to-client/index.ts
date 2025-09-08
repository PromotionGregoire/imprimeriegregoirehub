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
    console.log('=== SEND PROOF TO CLIENT START ===');
    
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON in request body');
    }
    
    const { proofId }: SendProofRequest = parsedBody;
    console.log('Parsed proofId:', proofId);

    if (!proofId) {
      throw new Error('proofId is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Vérifier les secrets Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('RESEND_FROM_PROOFS');
    const replyToEmail = Deno.env.get('RESEND_REPLY_TO');
    
    console.log('Environment check:', {
      hasResendKey: !!resendApiKey,
      hasFromEmail: !!fromEmail,
      hasReplyTo: !!replyToEmail
    });
    
    if (!resendApiKey || !fromEmail || !replyToEmail) {
      console.error('Missing Resend configuration:', {
        resendApiKey: !!resendApiKey,
        fromEmail: !!fromEmail,
        replyToEmail: !!replyToEmail
      });
      throw new Error('Email configuration incomplete. Please check RESEND_API_KEY, RESEND_FROM_PROOFS, and RESEND_REPLY_TO secrets.');
    }

    console.log('Fetching proof with ID:', proofId);

    // Get proof details
    const { data: proof, error: proofError } = await supabase
      .from('proofs')
      .select('*')
      .eq('id', proofId)
      .single();

    if (proofError) {
      console.error('Proof fetch error:', proofError);
      throw new Error(`Proof not found: ${proofError.message}`);
    }

    if (!proof) {
      throw new Error('Proof not found');
    }

    console.log('Proof found:', { id: proof.id, version: proof.version, status: proof.status });

    // Verify proof has a file
    if (!proof.file_url) {
      throw new Error('Cette épreuve n\'a pas encore de fichier attaché');
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', proof.order_id)
      .single();

    if (orderError || !order) {
      console.error('Order fetch error:', orderError);
      throw new Error('Order not found');
    }

    console.log('Order found:', { order_number: order.order_number, client_id: order.client_id });

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', order.client_id)
      .single();

    if (clientError || !client) {
      console.error('Client fetch error:', clientError);
      throw new Error('Client not found');
    }

    console.log('Client found:', { business_name: client.business_name, email: client.email });

    if (!client.email) {
      throw new Error('Aucune adresse email trouvée pour ce client');
    }

    // Generate or use existing approval token
    let approvalToken = proof.approval_token;
    if (!approvalToken) {
      approvalToken = crypto.randomUUID();
      console.log('Generated new approval token');
      
      const { error: updateTokenError } = await supabase
        .from('proofs')
        .update({ 
          approval_token: approvalToken,
          updated_at: new Date().toISOString()
        })
        .eq('id', proofId);

      if (updateTokenError) {
        console.error('Token update error:', updateTokenError);
        throw new Error('Failed to generate approval token');
      }
    }

    // Update proof status to "Envoyée au client"
    console.log('Updating proof status...');
    const { error: statusError } = await supabase
      .from('proofs')
      .update({ 
        status: 'Envoyée au client',
        updated_at: new Date().toISOString()
      })
      .eq('id', proofId);

    if (statusError) {
      console.error('Status update error:', statusError);
      // Don't throw here - the trigger might fail but we can still continue
      console.log('Continuing despite status update error...');
    } else {
      console.log('Proof status updated successfully');
    }

    // Build approval URL
    const baseUrl = Deno.env.get('PUBLIC_PORTAL_BASE_URL') || 'https://client.promotiongregoire.com';
    const approvalUrl = `${baseUrl}/approve/proof/${approvalToken}`;
    console.log('Approval URL generated:', approvalUrl);

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Email content
    const subject = `Épreuve ${order.order_number} — version ${proof.version}`;
    
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

    console.log('Preparing email for:', client.email, `(${client.contact_name || client.business_name}) - Order: ${order.order_number}`);

    // Send email
    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: [client.email],
      reply_to: replyToEmail,
      subject,
      html,
    });

    if (emailResult.error) {
      console.error('Email send error:', emailResult.error);
      return new Response(JSON.stringify({ 
        error: `Failed to send email: ${emailResult.error.message}` 
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Email sent successfully:', emailResult.data?.id);

    // Log the email notification
    try {
      await supabase.from('email_notifications').insert({
        email_type: 'proof_notification',
        proof_id: proofId,
        recipient_email: client.email,
        sent_at: new Date().toISOString(),
        success: true,
      });
      console.log('Email notification logged');
    } catch (logError) {
      console.error('Failed to log email notification:', logError);
      // Don't fail the whole operation if logging fails
    }

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