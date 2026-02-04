import { NextRequest, NextResponse } from 'next/server'
import { getStripeServer } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripeServer()
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const stripe = getStripeServer()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription' || !session.subscription || !session.customer) {
          break
        }
        const userId = (session.client_reference_id || session.metadata?.user_id) as string
        const planId = (session.metadata?.plan_id) as string
        if (!userId || !planId) {
          console.error('checkout.session.completed: missing user_id or plan_id in metadata')
          break
        }
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const periodStart = new Date((sub.current_period_start as number) * 1000)
        const periodEnd = new Date((sub.current_period_end as number) * 1000)
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id

        const { data: existing } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()

        if (existing) {
          await supabase
            .from('subscriptions')
            .update({
              plan_id: planId,
              status: sub.status === 'active' ? 'active' : 'trial',
              billing_cycle: sub.items.data[0]?.plan?.interval === 'year' ? 'yearly' : 'monthly',
              stripe_customer_id: customerId,
              stripe_subscription_id: sub.id,
              current_period_start: periodStart.toISOString(),
              current_period_end: periodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
        } else {
          await supabase.from('subscriptions').insert({
            user_id: userId,
            plan_id: planId,
            status: sub.status === 'active' ? 'active' : 'trial',
            billing_cycle: sub.items.data[0]?.plan?.interval === 'year' ? 'yearly' : 'monthly',
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
          })
        }

        const { data: subRow } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (subRow) {
          await supabase.from('subscription_usage').upsert(
            {
              subscription_id: subRow.id,
              period_start: periodStart.toISOString(),
              period_end: periodEnd.toISOString(),
              messages_used: 0,
              voice_minutes_used: 0,
              leads_created: 0,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'subscription_id,period_start' }
          )
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const periodStart = new Date((sub.current_period_start as number) * 1000)
        const periodEnd = new Date((sub.current_period_end as number) * 1000)
        const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status === 'past_due' ? 'past_due' : 'cancelled'

        await supabase
          .from('subscriptions')
          .update({
            status: sub.status === 'trialing' ? 'trial' : status,
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      default:
        // Unhandled event type
        break
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
