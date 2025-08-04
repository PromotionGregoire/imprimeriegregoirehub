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

    // Find any proof with this approval token to get the order_id
    const { data: tokenProof, error: tokenError } = await supabase
      .from('proofs')
      .select('order_id, id')
      .eq('approval_token', token)
      .single();

    if (tokenError || !tokenProof) {
      console.error('Token not found:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Token invalide ou épreuve non trouvée' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Token found for order:', tokenProof.order_id);

    // Get the latest proof version for this order
    const { data: latestProof, error: proofError } = await supabase
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
        order_id,
        approval_token,
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
              email
            )
          )
        )
      `)
      .eq('order_id', tokenProof.order_id)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (proofError || !latestProof) {
      console.error('Latest proof not found:', proofError);
      return new Response(
        JSON.stringify({ error: 'Dernière version de l\'épreuve non trouvée' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get all proof comments from previous versions for this order
    const { data: proofHistory, error: historyError } = await supabase
      .from('proofs')
      .select(`
        id,
        version,
        status,
        client_comments,
        approved_at,
        approved_by_name,
        created_at
      `)
      .eq('order_id', tokenProof.order_id)
      .not('client_comments', 'is', null)
      .neq('client_comments', '')
      .order('version', { ascending: false });

    // Get order history for this proof
    const { data: orderHistory, error: orderHistoryError } = await supabase
      .from('v_ordre_historique')
      .select('*')
      .eq('order_id', tokenProof.order_id)
      .order('created_at', { ascending: false });

    console.log('Latest proof found successfully, version:', latestProof.version);

    return new Response(
      JSON.stringify({ 
        success: true,
        proof: latestProof,
        proofHistory: proofHistory || [],
        orderHistory: orderHistory || []
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-public-proof-details function:', error);
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