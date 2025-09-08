import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== TESTING SUBMISSION EMAIL FUNCTION ===');
    
    // Test data
    const testData = {
      clientEmail: 'Vanyster@icloud.com',
      clientName: 'First Week September',
      businessName: 'Septembre 08-12',
      submissionId: 'test-id',
      submissionNumber: 'S-TEST-001',
      totalPrice: 100.00,
      acceptanceToken: '9a9d2326-007e-432b-9078-d928c4ddda7a',
      items: [
        {
          product_name: 'Test Product',
          description: 'Test description',
          quantity: 1,
          unit_price: 100.00
        }
      ],
    };

    console.log('Calling send-submission-notification with test data:', testData);

    // Call the actual submission notification function
    const response = await fetch('https://ytcrplsistsxfaxkfqqp.supabase.co/functions/v1/send-submission-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('Response from send-submission-notification:', result);

    return new Response(JSON.stringify({ 
      success: response.ok,
      status: response.status,
      result 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in test function:', error);
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