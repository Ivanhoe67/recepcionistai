import Stripe from 'stripe'

/**
 * Server-side Stripe client. Use only in API routes or server code.
 * Requires STRIPE_SECRET_KEY in env.
 */
export function getStripeServer(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(key)
}
