export const dynamic = 'force-dynamic'
import Razorpay from 'razorpay'
import { connectDB } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/models/User'
import { ok, unauthorized, badRequest, serverError } from '@/lib/api'
import { FREE_ONLY_MODE, RAZORPAY_CONFIGURED } from '@/lib/flags'

export async function POST() {
  try {
    const authUser = getCurrentUser()
    if (!authUser) return unauthorized()
    if (FREE_ONLY_MODE) return badRequest('Payments are disabled in free-only mode')

    if (!RAZORPAY_CONFIGURED) {
      return badRequest('Razorpay is not configured')
    }

    const keyId = process.env.RAZORPAY_KEY_ID as string
    const keySecret = process.env.RAZORPAY_KEY_SECRET as string
    const planId = process.env.RAZORPAY_PLAN_ID as string

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120,
    })

    await connectDB()
    await User.updateOne(
      { _id: authUser.id },
      { $set: { subscriptionStatus: 'pending', subscriptionId: subscription.id } }
    )

    return ok({ subscriptionId: subscription.id, keyId })
  } catch (err) {
    return serverError(err)
  }
}
