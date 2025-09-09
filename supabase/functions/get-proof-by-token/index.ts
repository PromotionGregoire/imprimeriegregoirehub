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
    let token: string | null = null;

    // Supporter à la fois POST avec body JSON et GET avec query param
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        token = body.token;
      } catch (e) {
        console.error('Invalid JSON body:', e);
      }
    }
    
    // Fallback vers query param si pas de token via POST
    if (!token) {
      const url = new URL(req.url);
      token = url.searchParams.get('token');
    }

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

    // Use secure function to get proof data without exposing sensitive information
    const { data: proofData, error: proofError } = await supabase
      .rpc('get_proof_for_approval', { p_approval_token: token });

    if (proofError || !proofData || proofData.length === 0) {
      console.error('Token not found or invalid:', proofError);
      return new Response(
        JSON.stringify({ error: 'Token invalide ou épreuve non trouvée' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const proof = proofData[0];

    // Get file URL separately using secure function
    const { data: fileData, error: fileError } = await supabase
      .rpc('get_proof_file_url', { p_approval_token: token });

    const fileUrl = (fileData && fileData.length > 0) ? fileData[0].file_url : null;

    if (fileError) {
      console.error('Error getting file URL:', fileError);
    }

    // Get all proof comments from previous versions for this order (authenticated query)
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
      .eq('order_id', proof.order_id)
      .not('client_comments', 'is', null)
      .neq('client_comments', '')
      .order('version', { ascending: false });

    // Get order history for this proof
    const { data: orderHistory, error: orderHistoryError } = await supabase
      .from('v_ordre_historique')
      .select('*')
      .eq('order_id', proof.order_id)
      .order('created_at', { ascending: false });

    console.log('Latest proof found successfully, version:', proof.version);

    // Build secure response that excludes sensitive financial information
    const secureProof = {
      id: proof.id,
      status: proof.status,
      file_url: fileUrl,
      version: proof.version,
      client_comments: proof.client_comments,
      approved_at: proof.approved_at,
      approved_by_name: proof.approved_by_name,
      created_at: proof.created_at,
      order_id: proof.order_id,
      order_number: proof.order_number,
      business_name: proof.business_name,
      contact_name: proof.contact_name,
      submission_number: proof.submission_number
      // Explicitly exclude sensitive financial data like total_price
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        proof: secureProof,
        proofHistory: proofHistory || [],
        orderHistory: orderHistory || []
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