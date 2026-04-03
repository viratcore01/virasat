export const dynamic = 'force-dynamic'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { ok, badRequest } from '@/lib/api'
import { FREE_ONLY_MODE } from '@/lib/flags'

export async function POST(req: Request) {
  if (FREE_ONLY_MODE) return ok({ received: true, skipped: true })
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return badRequest('Razorpay webhook not configured')

  const signature = req.headers.get('x-razorpay-signature') || ''
  const body = await req.text()

  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (signature !== expected) return badRequest('Invalid signature')

  const payload = JSON.parse(body)
  const event = payload.event as string
  const subscription = payload.payload?.subscription?.entity

  if (!subscription?.id) return ok({ received: true })

  const updates: Record<string, unknown> = {}
  if (event === 'subscription.activated' || event === 'subscription.charged') {
    updates.subscriptionStatus = 'active'
    if (subscription.current_end) {
      updates.subscriptionCurrentEnd = new Date(subscription.current_end * 1000)
    }
  }
  if (event === 'subscription.cancelled' || event === 'subscription.completed') {
    updates.subscriptionStatus = 'cancelled'
  }

  if (Object.keys(updates).length > 0) {
    await connectDB()
    await User.updateOne({ subscriptionId: subscription.id }, { $set: updates })
  }

  return ok({ received: true })
}
