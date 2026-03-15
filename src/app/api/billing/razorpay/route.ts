export const dynamic = 'force-dynamic'
import Razorpay from 'razorpay'
import { connectDB } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/models/User'
import { ok, unauthorized, badRequest, serverError } from '@/lib/api'

export async function POST() {
  try {
    const authUser = getCurrentUser()
    if (!authUser) return unauthorized()

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const planId = process.env.RAZORPAY_PLAN_ID

    if (!keyId || !keySecret || !planId) {
      return badRequest('Razorpay is not configured')
    }

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
