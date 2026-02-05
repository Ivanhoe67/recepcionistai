import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripeServer } from '@/lib/stripe'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Get the customer ID from the subscription
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (!subscription?.stripe_customer_id) {
            return NextResponse.json(
                { error: 'No se encontró un cliente de Stripe para este usuario. Primero debes suscribirte a un plan.' },
                { status: 400 }
            )
        }

        const stripe = getStripeServer()
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${baseUrl}/settings/subscription`,
        })

        return NextResponse.json({ url: session.url })
    } catch (err) {
        console.error('Stripe billing portal error:', err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Error al crear sesión de facturación' },
            { status: 500 }
        )
    }
}
