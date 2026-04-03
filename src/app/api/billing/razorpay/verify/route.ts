export const dynamic = 'force-dynamic'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/models/User'
import { ok, unauthorized, badRequest, serverError } from '@/lib/api'

export async function POST(req: Request) {
  try {
    const authUser = getCurrentUser()
    if (!authUser) return unauthorized()

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) return badRequest('Razorpay is not configured')

    const body = await req.json()
    const paymentId = body.razorpay_payment_id as string | undefined
    const subscriptionId = body.razorpay_subscription_id as string | undefined
    const signature = body.razorpay_signature as string | undefined

    if (!paymentId || !subscriptionId || !signature) {
      return badRequest('Missing payment details')
    }

    const payloadA = `${paymentId}|${subscriptionId}`
    const payloadB = `${subscriptionId}|${paymentId}`
    const expectedA = crypto.createHmac('sha256', keySecret).update(payloadA).digest('hex')
    const expectedB = crypto.createHmac('sha256', keySecret).update(payloadB).digest('hex')

    if (signature !== expectedA && signature !== expectedB) {
      return badRequest('Invalid signature')
    }

    await connectDB()
    await User.updateOne(
      { _id: authUser.id },
      { $set: { subscriptionStatus: 'active', subscriptionId } }
    )

    return ok({ verified: true })
  } catch (err) {
    return serverError(err)
  }
}
