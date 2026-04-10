export const dynamic = 'force-dynamic'
import { connectDB } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/models/User'
import { ok, unauthorized, badRequest, serverError } from '@/lib/api'
import { FREE_ONLY_MODE } from '@/lib/flags'

export async function POST(req: Request) {
  try {
    const authUser = getCurrentUser()
    if (!authUser) return unauthorized()
    if (FREE_ONLY_MODE) return badRequest('Payments are disabled in free-only mode')

    // For Stripe, payment verification is handled via webhooks
    // This endpoint can be used to check subscription status
    await connectDB()

    const user = await User.findById(authUser.id).select('subscriptionStatus').lean() as { subscriptionStatus: string } | null
    if (!user) return badRequest('User not found')

    return ok({
      subscriptionStatus: user.subscriptionStatus,
      isActive: user.subscriptionStatus === 'active'
    })
  } catch (err) {
    return serverError(err)
  }
}
