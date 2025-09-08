import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface NotifyPasswordChangeRequest {
  user_id: string;
  user_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: NotifyPasswordChangeRequest = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user profile information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', requestData.user_id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Get admin email for notification
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'ADMIN')
      .limit(1)
      .single();

    const adminEmail = 'info@promotiongregoire.com'; // Default admin email

    // Send notification to employee
    const employeeEmailResponse = await resend.emails.send({
      from: 'PromoFlow <info@promotiongregoire.com>',
      to: [requestData.user_email],
      subject: 'Mot de passe changé avec succès - PromoFlow',
      html: `
        <h1>Mot de passe changé avec succès</h1>
        <p>Bonjour ${profile?.full_name || 'Employé'},</p>
        <p>Votre mot de passe PromoFlow a été changé avec succès.</p>
        <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <p>Si vous n'avez pas effectué ce changement, veuillez contacter immédiatement votre administrateur.</p>
        <br>
        <p>Cordialement,</p>
        <p>L'équipe PromoFlow - Imprimerie Grégoire</p>
      `,
    });

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: 'PromoFlow <info@promotiongregoire.com>',
      to: [adminEmail],
      subject: 'Changement de mot de passe employé - PromoFlow',
      html: `
        <h1>Changement de mot de passe employé</h1>
        <p>Bonjour Admin,</p>
        <p>L'employé <strong>${profile?.full_name || 'Employé'}</strong> (${requestData.user_email}) a changé son mot de passe temporaire avec succès.</p>
        <p>L'employé peut maintenant accéder normalement au système PromoFlow.</p>
        <p>Date et heure: ${new Date().toLocaleString('fr-CA', { timeZone: 'America/Montreal' })}</p>
        <br>
        <p>Cordialement,</p>
        <p>Système PromoFlow</p>
      `,
    });

    console.log('Employee email sent:', employeeEmailResponse);
    console.log('Admin email sent:', adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password change notifications sent successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in notify-password-change function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);