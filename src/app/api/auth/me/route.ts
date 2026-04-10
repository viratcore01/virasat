export const dynamic = 'force-dynamic'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/api'

export async function GET() {
  try {
    const authUser = getCurrentUser()
    if (!authUser) return unauthorized()

    await connectDB()
    const user = await User.findById(authUser.id).select('-passwordHash -serverShare').lean()
    if (!user) return unauthorized()

    return ok(user)
  } catch (err) {
    return serverError(err)
  }
}

