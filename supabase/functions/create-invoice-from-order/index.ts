import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateInvoiceRequest {
  order_id: string;
}

interface CreateInvoiceResponse {
  invoice_id: string;
  invoice_number: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id }: CreateInvoiceRequest = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'order_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key for full database access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Fetch order details with related submission and client data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        submission_id,
        client_id,
        total_price,
        submissions!inner(
          client_id,
          clients!inner(
            business_name,
            contact_name,
            email
          )
        )
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invoice already exists for this order
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('order_id', order_id)
      .maybeSingle();

    if (existingInvoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice already exists for this order' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch submission items for invoice lines
    const { data: submissionItems, error: itemsError } = await supabase
      .from('submission_items')
      .select(`
        id,
        product_name,
        description,
        quantity,
        unit_price
      `)
      .eq('submission_id', order.submission_id);

    if (itemsError) {
      console.error('Error fetching submission items:', itemsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch submission items' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        client_id: order.client_id,
        submission_id: order.submission_id,
        order_id: order_id,
        status: 'draft',
        currency: 'CAD',
        subtotal: 0, // Will be calculated by trigger
        taxes: 0,
        total: 0, // Will be calculated by trigger
        balance_due: 0, // Will be calculated by trigger
      })
      .select('id, number')
      .single();

    if (invoiceError || !invoice) {
      console.error('Error creating invoice:', invoiceError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invoice' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create invoice lines from submission items
    if (submissionItems && submissionItems.length > 0) {
      const invoiceLines = submissionItems.map((item) => ({
        invoice_id: invoice.id,
        label: item.product_name + (item.description ? ` - ${item.description}` : ''),
        qty: item.quantity,
        unit_price: item.unit_price,
      }));

      const { error: linesError } = await supabase
        .from('invoice_lines')
        .insert(invoiceLines);

      if (linesError) {
        console.error('Error creating invoice lines:', linesError);
        // Rollback: delete the invoice
        await supabase.from('invoices').delete().eq('id', invoice.id);
        return new Response(
          JSON.stringify({ error: 'Failed to create invoice lines' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Force recalculation of totals by updating the invoice
    // This will trigger the invoices_set_defaults function
    await supabase
      .from('invoices')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', invoice.id);

    const response: CreateInvoiceResponse = {
      invoice_id: invoice.id,
      invoice_number: invoice.number,
    };

    console.log(`Successfully created invoice ${invoice.number} for order ${order.order_number}`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in create-invoice-from-order:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});