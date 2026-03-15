export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { verifyPassword, signToken, setAuthCookie, clearAuthCookie } from '@/lib/auth'
import { ok, badRequest, unauthorized, serverError } from '@/lib/api'
import { z } from 'zod'

// ─── LOGIN ────────────────────────────────────────────────────────────────────

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) return badRequest('Invalid credentials')

    const { email, password } = parsed.data
    const user = await User.findOne({ email })

    if (!user) return unauthorized('Invalid email or password')

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return unauthorized('Invalid email or password')

    // Update last seen
    await User.updateOne({ _id: user._id }, { $set: { lastSeen: new Date() } })

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      encryptionSalt: user.encryptionSalt,
      status: user.status,
    })

    setAuthCookie(token)

    return ok({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        encryptionSalt: user.encryptionSalt,
        status: user.status,
      }
    }, 'Logged in')
  } catch (err) {
    return serverError(err)
  }
}

