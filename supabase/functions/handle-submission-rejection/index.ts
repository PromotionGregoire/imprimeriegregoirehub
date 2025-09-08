import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RejectionRequest {
  submission_id: string;
  rejection_reason?: string;
}

interface RejectionResponse {
  success: boolean;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_id, rejection_reason }: RejectionRequest = await req.json();
    
    if (!submission_id) {
      return new Response(
        JSON.stringify({ error: 'submission_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Fetch and validate submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('id, status, submission_number')
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      console.error('Submission not found:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Submission not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (submission.status !== 'En attente d\'approbation') {
      return new Response(
        JSON.stringify({ error: 'Invalid submission status for rejection' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update submission status to rejected
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ 
        status: 'Rejetée',
        modification_request_notes: rejection_reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', submission_id);

    if (updateError) {
      console.error('Error updating submission status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to reject submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response: RejectionResponse = {
      success: true,
      message: `Submission ${submission.submission_number} has been rejected`,
    };

    console.log(`Successfully rejected submission ${submission.submission_number}: ${rejection_reason}`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in handle-submission-rejection:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});