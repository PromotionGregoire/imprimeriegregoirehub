import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token requis' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching proof with token:', token);

    // Find the proof by approval token
    const { data: proof, error: proofError } = await supabase
      .from('proofs')
      .select(`
        id,
        status,
        file_url,
        version,
        client_comments,
        approved_at,
        approved_by_name,
        created_at,
        orders (
          order_number,
          total_price,
          submission_id,
          submissions (
            submission_number,
            client_id,
            clients (
              business_name,
              contact_name,
              contact_email
            )
          )
        )
      `)
      .eq('approval_token', token)
      .single();

    if (proofError || !proof) {
      console.error('Proof not found:', proofError);
      return new Response(
        JSON.stringify({ error: 'Épreuve non trouvée ou token invalide' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Proof found successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        proof
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-proof-by-token function:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);