import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubmissionRequest {
  token: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: SubmissionRequest = await req.json();

    if (!token) {
      throw new Error('Token is required');
    }

    console.log('Searching for submission with token:', token);

    // Create Supabase client with service role for unrestricted access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get submission with all related data
    const { data: submission, error } = await supabase
      .from('submissions')
      .select(`
        *,
        clients!inner (
          business_name,
          contact_name,
          email,
          phone_number
        ),
        submission_items (
          id,
          product_name,
          description,
          quantity,
          unit_price
        )
      `)
      .eq('acceptance_token', token)
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!submission) {
      console.error('No submission found for token:', token);
      throw new Error('Submission not found');
    }

    console.log('Submission found:', submission.submission_number);

    // Calculate totals for submission items
    const itemsWithTotals = submission.submission_items.map((item: any) => ({
      ...item,
      total_price: item.quantity * parseFloat(item.unit_price)
    }));

    const responseData = {
      ...submission,
      submission_items: itemsWithTotals
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in get-submission-by-token function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});