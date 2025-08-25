import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      throw new Error('Missing stripe signature or webhook secret')
    }

    // In a real implementation, you would verify the webhook signature
    // using Stripe's webhook signature verification
    // For this demo, we'll parse the event directly
    const event = JSON.parse(body)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Received Stripe webhook:', event.type)

    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(supabaseClient, event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabaseClient, event.data.object)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabaseClient, event.data.object)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabaseClient, event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabaseClient, event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function handleInvoicePaymentSucceeded(supabase: any, stripeInvoice: any) {
  try {
    // Find the invoice by Stripe invoice ID (you'd store this in metadata)
    const invoiceId = stripeInvoice.metadata?.supabase_invoice_id
    
    if (!invoiceId) {
      console.log('No Supabase invoice ID found in Stripe invoice metadata')
      return
    }

    // Update invoice status to paid
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', invoiceId)

    if (error) {
      throw error
    }

    console.log(`Invoice ${invoiceId} marked as paid`)

    // You could also trigger additional actions here:
    // - Send confirmation email
    // - Update subscription status
    // - Generate receipt
    // - Update work order status

  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
    throw error
  }
}

async function handleInvoicePaymentFailed(supabase: any, stripeInvoice: any) {
  try {
    const invoiceId = stripeInvoice.metadata?.supabase_invoice_id
    
    if (!invoiceId) {
      console.log('No Supabase invoice ID found in Stripe invoice metadata')
      return
    }

    // Update invoice status to overdue
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'overdue'
      })
      .eq('id', invoiceId)

    if (error) {
      throw error
    }

    console.log(`Invoice ${invoiceId} marked as overdue`)

    // You could also trigger additional actions here:
    // - Send payment failure notification
    // - Suspend services
    // - Schedule retry attempts

  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
    throw error
  }
}

async function handleSubscriptionCreated(supabase: any, stripeSubscription: any) {
  try {
    const orgId = stripeSubscription.metadata?.org_id
    const propertyId = stripeSubscription.metadata?.property_id
    const service = stripeSubscription.metadata?.service
    
    if (!orgId || !propertyId || !service) {
      console.log('Missing required metadata in subscription')
      return
    }

    // Create subscription record
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        org_id: orgId,
        property_id: propertyId,
        service: service,
        status: 'active',
        frequency_months: 6, // Default to 6 months
        price_per_service: stripeSubscription.items.data[0]?.price?.unit_amount / 100, // Convert from cents
        next_service_date: calculateNextServiceDate(6)
      })

    if (error) {
      throw error
    }

    console.log(`Subscription created for org ${orgId}`)

  } catch (error) {
    console.error('Error handling subscription created:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(supabase: any, stripeSubscription: any) {
  try {
    const subscriptionId = stripeSubscription.metadata?.supabase_subscription_id
    
    if (!subscriptionId) {
      console.log('No Supabase subscription ID found in Stripe subscription metadata')
      return
    }

    const status = stripeSubscription.status === 'active' ? 'active' : 
                  stripeSubscription.status === 'past_due' ? 'past_due' : 'cancelled'

    // Update subscription status
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: status,
        price_per_service: stripeSubscription.items.data[0]?.price?.unit_amount / 100
      })
      .eq('id', subscriptionId)

    if (error) {
      throw error
    }

    console.log(`Subscription ${subscriptionId} updated to ${status}`)

  } catch (error) {
    console.error('Error handling subscription updated:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(supabase: any, stripeSubscription: any) {
  try {
    const subscriptionId = stripeSubscription.metadata?.supabase_subscription_id
    
    if (!subscriptionId) {
      console.log('No Supabase subscription ID found in Stripe subscription metadata')
      return
    }

    // Update subscription status to cancelled
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled'
      })
      .eq('id', subscriptionId)

    if (error) {
      throw error
    }

    console.log(`Subscription ${subscriptionId} cancelled`)

  } catch (error) {
    console.error('Error handling subscription deleted:', error)
    throw error
  }
}

function calculateNextServiceDate(frequencyMonths: number): string {
  const nextDate = new Date()
  nextDate.setMonth(nextDate.getMonth() + frequencyMonths)
  return nextDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
}
