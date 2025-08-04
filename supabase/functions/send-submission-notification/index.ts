import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { SubmissionNotificationEmail } from "./_templates/submission-notification.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubmissionNotificationRequest {
  clientEmail: string;
  clientName: string;
  businessName: string;
  submissionId: string;
  submissionNumber: string;
  totalPrice: number;
  acceptanceToken: string;
  items: Array<{
    product_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }>;
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
      submissionId,
      submissionNumber,
      totalPrice,
      acceptanceToken,
      items
    }: SubmissionNotificationRequest = await req.json();

    console.log(`Sending submission notification to: ${clientEmail} for submission ${submissionNumber}`);

    // Créer l'URL d'approbation
    const approvalUrl = `https://ytcrplsistsxfaxkfqqp.lovable.app/approve/submission/${acceptanceToken}`;

    // Render the email template
    const html = await renderAsync(
      React.createElement(SubmissionNotificationEmail, {
        clientName,
        businessName,
        submissionNumber,
        totalPrice,
        items,
        approvalUrl,
      })
    );

    // Send the email
    const emailResponse = await resend.emails.send({
      from: 'Imprimerie Grégoire <info@promotiongregoire.com>',
      to: [clientEmail],
      subject: `📄 Nouvelle soumission ${submissionNumber} - ${businessName}`,
      html,
    });

    if (emailResponse.error) {
      throw emailResponse.error;
    }

    console.log('Submission notification sent successfully:', emailResponse.data?.id);

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
    console.error('Error in send-submission-notification function:', error);
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