export const dynamic = 'force-dynamic'
import Stripe from 'stripe'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { ok, badRequest } from '@/lib/api'
import { FREE_ONLY_MODE } from '@/lib/flags'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
})
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'

export async function POST(req: Request) {
  if (FREE_ONLY_MODE) return ok({ received: true, skipped: true })

  const sig = req.headers.get('stripe-signature') as string
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return badRequest('Invalid signature')
  }

  await connectDB()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId

      if (userId) {
        await User.updateOne(
          { _id: userId },
          { $set: { subscriptionStatus: 'active' } }
        )
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string

      const user = await User.findOne({ subscriptionId })
      if (user) {
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              subscriptionStatus: 'active',
              subscriptionCurrentEnd: new Date(invoice.period_end * 1000)
            }
          }
        )
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string

      const user = await User.findOne({ subscriptionId })
      if (user) {
        await User.updateOne(
          { _id: user._id },
          { $set: { subscriptionStatus: 'past_due' } }
        )
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const user = await User.findOne({ subscriptionId: subscription.id })
      if (user) {
        await User.updateOne(
          { _id: user._id },
          { $set: { subscriptionStatus: 'cancelled' } }
        )
      }
      break
    }
  }

  return ok({ received: true })
}
