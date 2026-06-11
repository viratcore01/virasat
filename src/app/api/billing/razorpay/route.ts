export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { User, Subscription } from '@/models'
import { ok, unauthorized, badRequest, serverError } from '@/lib/api'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const PLANS = {
  free: { name: 'Free', assetLimit: 15, executorLimit: 1, videoMessages: false },
  premium: { name: 'Premium', assetLimit: Infinity, executorLimit: 3, videoMessages: true },
} as const

type PlanId = keyof typeof PLANS

function isPlanId(value: string): value is PlanId {
  return value === 'free' || value === 'premium'
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getCurrentUser()
    if (!authUser) return unauthorized()

    await connectDB()

    const user = await User.findById(authUser.id)
    if (!user) return badRequest('User not found')

    const body = await req.json().catch(() => ({}))
    const planId = typeof body?.planId === 'string' ? body.planId.toLowerCase() : 'premium'

    if (!isPlanId(planId)) {
      return badRequest('Invalid plan')
    }

    const plan = PLANS[planId]

    if (planId === 'premium') {
      const existingSubscription = await Subscription.findOne({ userId: user._id })
      
      if (existingSubscription?.razorpaySubscriptionId) {
        await razorpay.subscriptions.cancel({
          subscription_id: existingSubscription.razorpaySubscriptionId,
          cancel_at_cycle_end: false,
        })
      }

      const subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID_MONTHLY!,
        customer_notify: 1,
        total_count: 12,
        notes: { userId: user._id.toString() },
      })

      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            plan: 'premium',
            status: 'pending',
            razorpaySubscriptionId: subscription.id,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        { upsert: true, new: true }
      )

      await User.updateOne(
        { _id: user._id },
        { $set: { plan: 'premium', subscriptionStatus: 'pending' } }
      )

      return ok({
        subscriptionId: subscription.id,
        status: subscription.status,
        shortUrl: subscription.short_url,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
      })
    }

    await Subscription.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          plan: 'free',
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      },
      { upsert: true, new: true }
    )

    await User.updateOne(
      { _id: user._id },
      { $set: { plan: 'free', subscriptionStatus: 'cancelled' } }
    )

    return ok({ success: true, plan: 'free' })
  } catch (err) {
    console.error('Razorpay subscription creation failed:', err)
    return serverError(err)
  }
}

