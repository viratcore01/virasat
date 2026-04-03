export const dynamic = 'force-dynamic'
import Stripe from 'stripe'
import { connectDB } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/models/User'
import { ok, unauthorized, badRequest, serverError } from '@/lib/api'
import { FREE_ONLY_MODE, STRIPE_CONFIGURED } from '@/lib/flags'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
})

export async function POST() {
  try {
    const authUser = getCurrentUser()
    if (!authUser) return unauthorized()
    if (FREE_ONLY_MODE) return badRequest('Payments are disabled in free-only mode')

    if (!STRIPE_CONFIGURED) {
      return badRequest('Stripe is not configured')
    }

    const priceId = process.env.STRIPE_PRICE_ID

    if (!priceId) {
      return badRequest('Stripe price ID is not configured')
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: {
        userId: authUser.id,
      },
    })

    await connectDB()
    await User.updateOne(
      { _id: authUser.id },
      { $set: { subscriptionStatus: 'pending', subscriptionId: session.id } }
    )

    return ok({ sessionId: session.id, url: session.url })
  } catch (err) {
    return serverError(err)
  }
}
