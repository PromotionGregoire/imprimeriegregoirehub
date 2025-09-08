import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { ProofNotificationEmail } from "./_templates/proof-notification.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProofNotificationRequest {
  clientEmail: string;
  clientName: string;
  businessName: string;
  proofId: string;
  approvalToken: string;
  orderNumber: string;
  submissionNumber: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      clientEmail, 
      clientName, 
      businessName, 
      proofId, 
      approvalToken, 
      orderNumber,
      submissionNumber 
    }: ProofNotificationRequest = await req.json();

    console.log(`Sending proof notification to: ${clientEmail} for proof ${proofId}`);

    // Generate the approval link
    const approvalUrl = `https://ytcrplsistsxfaxkfqqp.supabase.co/proof-approval/${proofId}?token=${approvalToken}`;

    // Render the email template
    const html = await renderAsync(
      React.createElement(ProofNotificationEmail, {
        clientName,
        businessName,
        approvalUrl,
        orderNumber,
        submissionNumber,
      })
    );

    // Send the email
    const emailResponse = await resend.emails.send({
      from: 'Imprimerie Grégoire <info@promotiongregoire.com>',
      to: [clientEmail],
      subject: `📋 Nouvelle épreuve à approuver - Commande ${orderNumber}`,
      html,
    });

    if (emailResponse.error) {
      throw emailResponse.error;
    }

    console.log('Proof notification sent successfully:', emailResponse.data?.id);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      recipient: clientEmail 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-proof-notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});