import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { testEmail } = await req.json();
    
    if (!testEmail) {
      throw new Error('Test email address is required');
    }

    console.log(`Sending test email to: ${testEmail}`);

    // Send test email
    const emailResponse = await resend.emails.send({
      from: 'Promotion Grégoire <onboarding@resend.dev>',
      to: [testEmail],
      subject: '✅ Test Email - Promotion Grégoire',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            ✅ Test Email Successful!
          </h1>
          
          <p>Félicitations ! Votre système d'email fonctionne parfaitement.</p>
          
          <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #10b981;">Configuration Email Validée</h3>
            <p><strong>Expéditeur :</strong> info@promotiongregoire.com</p>
            <p><strong>API Resend :</strong> Configurée correctement</p>
            <p><strong>Domaine :</strong> promotiongregoire.com</p>
            <p><strong>Date/Heure :</strong> ${new Date().toLocaleString('fr-CA')}</p>
          </div>
          
          <p>Votre système d'épreuves peut maintenant envoyer des emails aux clients !</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            Ceci est un email de test généré automatiquement par le système Promotion Grégoire.
          </p>
        </div>
      `,
    });

    console.log('Test email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test email sent successfully',
      emailId: emailResponse.data?.id,
      recipient: testEmail
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in test-email function:', error);
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