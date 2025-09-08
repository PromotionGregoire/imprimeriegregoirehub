import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendInvoiceRequest {
  invoice_id: string;
  to?: string; // Optional override email
}

interface SendInvoiceResponse {
  sent: boolean;
  email_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id, to }: SendInvoiceRequest = await req.json();

    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: 'invoice_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Fetch invoice details with client information and lines
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id,
        number,
        status,
        currency,
        subtotal,
        taxes,
        total,
        balance_due,
        due_at,
        clients!inner(
          business_name,
          contact_name,
          email
        ),
        invoice_lines(
          label,
          qty,
          unit_price,
          total
        )
      `)
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice not found:', invoiceError);
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invoice can be sent
    if (invoice.status !== 'draft' && invoice.status !== 'sent') {
      return new Response(
        JSON.stringify({ error: `Cannot send invoice with status: ${invoice.status}` }),
        { status: 412, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipientEmail = to || invoice.clients.email;
    const clientName = invoice.clients.contact_name;
    const businessName = invoice.clients.business_name;

    // Generate due date (30 days from now if not set)
    const dueDate = invoice.due_at 
      ? new Date(invoice.due_at).toLocaleDateString('fr-CA')
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA');

    // Generate invoice lines HTML
    const linesHtml = invoice.invoice_lines
      .map((line: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${line.label}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${line.qty}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${line.unit_price.toFixed(2)} ${invoice.currency}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${line.total.toFixed(2)} ${invoice.currency}</td>
        </tr>
      `)
      .join('');

    // Generate email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Facture ${invoice.number} - Imprimerie Grégoire</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #5a7a51; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .invoice-table th { background-color: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #5a7a51; }
          .totals { text-align: right; margin-top: 20px; }
          .total-row { font-weight: bold; font-size: 1.2em; color: #5a7a51; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 0.9em; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #5a7a51; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Facture ${invoice.number}</h1>
            <p>Imprimerie Grégoire</p>
          </div>
          
          <div class="content">
            <p>Bonjour ${clientName},</p>
            
            <p>Nous vous prions de trouver ci-joint votre facture pour les services d'impression que nous avons fournis à <strong>${businessName}</strong>.</p>
            
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qté</th>
                  <th>Prix unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${linesHtml}
              </tbody>
            </table>
            
            <div class="totals">
              <p>Sous-total: <strong>${invoice.subtotal.toFixed(2)} ${invoice.currency}</strong></p>
              <p>Taxes: <strong>${invoice.taxes.toFixed(2)} ${invoice.currency}</strong></p>
              <p class="total-row">Total: <strong>${invoice.total.toFixed(2)} ${invoice.currency}</strong></p>
              <p>Échéance: <strong>${dueDate}</strong></p>
            </div>
            
            <p>Nous vous remercions de votre confiance et restons à votre disposition pour toute question.</p>
            
            <p>Cordialement,<br>
            L'équipe Imprimerie Grégoire</p>
          </div>
          
          <div class="footer">
            <p>Imprimerie Grégoire<br>
            📞 Téléphone: (555) 123-4567<br>
            ✉️ Email: info@imprimerie-gregoire.ca<br>
            🌐 Web: www.imprimerie-gregoire.ca</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResult = await resend.emails.send({
      from: 'Imprimerie Grégoire <factures@imprimerie-gregoire.ca>',
      to: [recipientEmail],
      subject: `Facture ${invoice.number} - ${businessName}`,
      html: emailHtml,
    });

    if (emailResult.error) {
      console.error('Error sending email:', emailResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailResult.error }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update invoice status and issued_at
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        issued_at: now,
        due_at: invoice.due_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: now,
      })
      .eq('id', invoice_id);

    if (updateError) {
      console.error('Error updating invoice status:', updateError);
      // Don't fail the request since email was sent successfully
    }

    const response: SendInvoiceResponse = {
      sent: true,
      email_id: emailResult.data?.id,
    };

    console.log(`Successfully sent invoice ${invoice.number} to ${recipientEmail}`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in send-invoice-email:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});