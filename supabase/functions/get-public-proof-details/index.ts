import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract validation token from URL parameters
    const url = new URL(req.url);
    const validationToken = url.searchParams.get('token');

    console.log('Received validation token:', validationToken);

    if (!validationToken) {
      console.log('No validation token provided');
      return new Response(
        JSON.stringify({ error: 'Validation token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client with anon key for public access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('Searching for proof with validation token...');

    // Query proof with validation token and join related data
    const { data: proofData, error } = await supabase
      .from('proofs')
      .select(`
        id,
        version,
        status,
        file_url,
        created_at,
        validation_token,
        is_active,
        orders (
          id,
          order_number,
          total_price,
          status as order_status,
          submissions (
            id,
            submission_number,
            clients (
              id,
              business_name,
              contact_name,
              contact_email
            ),
            submission_items (
              id,
              product_name,
              quantity,
              unit_price,
              description
            )
          )
        )
      `)
      .eq('validation_token', validationToken)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Database error occurred' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!proofData) {
      console.log('No proof found with provided validation token');
      return new Response(
        JSON.stringify({ error: 'Proof not found or validation token invalid' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Proof found successfully:', proofData.id);

    // Structure the response data
    const responseData = {
      proof: {
        id: proofData.id,
        version: proofData.version,
        status: proofData.status,
        file_url: proofData.file_url,
        created_at: proofData.created_at
      },
      order: {
        id: proofData.orders?.id,
        order_number: proofData.orders?.order_number,
        total_price: proofData.orders?.total_price,
        status: proofData.orders?.order_status
      },
      submission: {
        id: proofData.orders?.submissions?.id,
        submission_number: proofData.orders?.submissions?.submission_number,
        items: proofData.orders?.submissions?.submission_items || []
      },
      client: {
        business_name: proofData.orders?.submissions?.clients?.business_name,
        contact_name: proofData.orders?.submissions?.clients?.contact_name,
        contact_email: proofData.orders?.submissions?.clients?.contact_email
      }
    };

    console.log('Returning proof details successfully');

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});