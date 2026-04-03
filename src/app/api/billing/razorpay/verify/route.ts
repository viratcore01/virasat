export const dynamic = 'force-dynamic'
import { connectDB } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/models/User'
import { ok, unauthorized, badRequest, serverError } from '@/lib/api'

export async function POST(req: Request) {
  try {
    const authUser = getCurrentUser()
    if (!authUser) return unauthorized()

    // For Stripe, payment verification is handled via webhooks
    // This endpoint can be used to check subscription status
    await connectDB()

    const user = await User.findById(authUser.id).select('subscriptionStatus').lean()
    if (!user) return badRequest('User not found')

    return ok({
      subscriptionStatus: user.subscriptionStatus,
      isActive: user.subscriptionStatus === 'active'
    })
  } catch (err) {
    return serverError(err)
  }
}
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
