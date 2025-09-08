import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecordPaymentRequest {
  invoice_id: string;
  amount: number;
  method: 'card' | 'ach' | 'cash' | 'check' | 'wire' | 'other';
  reference?: string;
  received_at?: string; // ISO timestamp, defaults to now
  provider?: Record<string, any>; // Stripe, PayPal, etc. metadata
}

interface RecordPaymentResponse {
  payment_id: string;
  new_status: string;
  remaining_balance: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      invoice_id, 
      amount, 
      method, 
      reference, 
      received_at, 
      provider 
    }: RecordPaymentRequest = await req.json();

    // Validate required fields
    if (!invoice_id || !amount || !method) {
      return new Response(
        JSON.stringify({ error: 'invoice_id, amount, and method are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Payment amount must be positive' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Fetch current invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, number, status, total, balance_due')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice not found:', invoiceError);
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invoice can receive payments
    if (!['sent', 'partial', 'overdue'].includes(invoice.status)) {
      return new Response(
        JSON.stringify({ error: `Cannot record payment for invoice with status: ${invoice.status}` }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for overpayment
    if (amount > invoice.balance_due) {
      return new Response(
        JSON.stringify({ 
          error: 'Payment amount exceeds remaining balance',
          balance_due: invoice.balance_due,
          attempted_amount: amount
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current user for created_by (if authenticated)
    const authHeader = req.headers.get('Authorization');
    let currentUserId = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      currentUserId = user?.id;
    }

    // Record the payment
    const paymentData = {
      invoice_id,
      amount,
      method,
      reference: reference || null,
      provider: provider || null,
      received_at: received_at || new Date().toISOString(),
      created_by: currentUserId,
    };

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentData)
      .select('id')
      .single();

    if (paymentError || !payment) {
      console.error('Error recording payment:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to record payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // The payment trigger will automatically update the invoice balance and status
    // Fetch the updated invoice to get the new status
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .select('status, balance_due')
      .eq('id', invoice_id)
      .single();

    if (updateError) {
      console.error('Error fetching updated invoice:', updateError);
      // Don't fail the request since payment was recorded successfully
    }

    const response: RecordPaymentResponse = {
      payment_id: payment.id,
      new_status: updatedInvoice?.status || invoice.status,
      remaining_balance: updatedInvoice?.balance_due || (invoice.balance_due - amount),
    };

    console.log(`Successfully recorded payment of ${amount} for invoice ${invoice.number}`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in record-payment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});