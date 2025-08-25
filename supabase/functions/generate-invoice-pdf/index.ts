import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { invoiceId } = await req.json()

    if (!invoiceId) {
      throw new Error('Invoice ID is required')
    }

    // Fetch invoice data with related information
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        work_orders (
          *,
          properties (
            *,
            organizations (*)
          ),
          work_order_items (*)
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError) {
      throw invoiceError
    }

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // Generate HTML for PDF
    const html = generateInvoiceHTML(invoice)

    // In a real implementation, you would use a PDF generation library
    // For this demo, we'll return the HTML content
    // You could use libraries like:
    // - https://deno.land/x/puppeteer@16.2.0/mod.ts
    // - https://deno.land/x/djot@0.2.3/mod.ts
    // - Or call an external PDF service

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function generateInvoiceHTML(invoice: any): string {
  const workOrder = invoice.work_orders
  const property = workOrder?.properties
  const organization = property?.organizations
  const items = workOrder?.work_order_items || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rechnung ${invoice.invoice_number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 40px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .invoice-info {
          text-align: right;
          flex: 1;
        }
        .invoice-number {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .customer-info {
          margin: 40px 0;
          padding: 20px;
          background-color: #f8fafc;
          border-radius: 8px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #2563eb;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        .items-table th,
        .items-table td {
          border: 1px solid #e2e8f0;
          padding: 12px;
          text-align: left;
        }
        .items-table th {
          background-color: #f1f5f9;
          font-weight: bold;
        }
        .items-table .number {
          text-align: right;
        }
        .totals {
          margin-top: 30px;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 5px 0;
        }
        .total-row.final {
          border-top: 2px solid #2563eb;
          font-weight: bold;
          font-size: 18px;
          margin-top: 20px;
          padding-top: 15px;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #64748b;
        }
        .work-details {
          margin: 30px 0;
          padding: 20px;
          background-color: #f8fafc;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">Fenstri GmbH</div>
          <div>Professioneller Fensterservice</div>
          <div>Musterstraße 123</div>
          <div>10115 Berlin</div>
          <div>Deutschland</div>
          <div>Tel: +49 30 123 456 789</div>
          <div>E-Mail: info@fenstri.de</div>
        </div>
        <div class="invoice-info">
          <div class="invoice-number">Rechnung ${invoice.invoice_number}</div>
          <div>Datum: ${formatDate(invoice.created_at)}</div>
          ${invoice.due_date ? `<div>Fällig: ${formatDate(invoice.due_date)}</div>` : ''}
        </div>
      </div>

      <div class="customer-info">
        <div class="section-title">Rechnungsadresse</div>
        <div><strong>${organization?.name || 'Kunde'}</strong></div>
        ${property ? `
          <div>${property.name}</div>
          <div>${property.address_line1}</div>
          ${property.address_line2 ? `<div>${property.address_line2}</div>` : ''}
          <div>${property.postal_code} ${property.city}</div>
        ` : ''}
      </div>

      ${workOrder ? `
        <div class="work-details">
          <div class="section-title">Arbeitsdetails</div>
          <div><strong>Service:</strong> ${
            workOrder.service === 'maintenance' ? 'Wartung' :
            workOrder.service === 'repair' ? 'Reparatur' : 'Inspektion'
          }</div>
          <div><strong>Beschreibung:</strong> ${workOrder.description}</div>
          ${workOrder.completed_at ? `<div><strong>Abgeschlossen am:</strong> ${formatDate(workOrder.completed_at)}</div>` : ''}
          ${workOrder.work_performed ? `
            <div style="margin-top: 15px;">
              <strong>Durchgeführte Arbeiten:</strong>
              <div style="margin-top: 5px; white-space: pre-line;">${workOrder.work_performed}</div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${items.length > 0 ? `
        <table class="items-table">
          <thead>
            <tr>
              <th>Beschreibung</th>
              <th class="number">Menge</th>
              <th class="number">Einzelpreis</th>
              <th class="number">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item: any) => `
              <tr>
                <td>${item.description}</td>
                <td class="number">${item.quantity}</td>
                <td class="number">${formatCurrency(item.unit_price)}</td>
                <td class="number">${formatCurrency(item.total_price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <div class="totals">
        <div class="total-row">
          <span>Zwischensumme:</span>
          <span>${formatCurrency(invoice.amount)}</span>
        </div>
        <div class="total-row">
          <span>MwSt. (19%):</span>
          <span>${formatCurrency(invoice.tax_amount)}</span>
        </div>
        <div class="total-row final">
          <span>Gesamtbetrag:</span>
          <span>${formatCurrency(invoice.total_amount)}</span>
        </div>
      </div>

      ${invoice.notes ? `
        <div style="margin-top: 40px;">
          <div class="section-title">Bemerkungen</div>
          <div style="white-space: pre-line;">${invoice.notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        <div><strong>Zahlungsbedingungen:</strong> Zahlbar innerhalb von 14 Tagen nach Rechnungsdatum.</div>
        <div><strong>Bankverbindung:</strong> IBAN: DE12 3456 7890 1234 5678 90, BIC: DEUTDEFF</div>
        <div style="margin-top: 20px;">
          <div>Fenstri GmbH • Geschäftsführer: Max Mustermann</div>
          <div>Amtsgericht Berlin HRB 12345 • USt-IdNr.: DE123456789</div>
        </div>
      </div>
    </body>
    </html>
  `
}
