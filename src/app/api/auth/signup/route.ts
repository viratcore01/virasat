export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth'
import { generateSalt } from '@/lib/crypto'
import { ok, badRequest, serverError } from '@/lib/api'
import { z } from 'zod'

const SignupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  password: z.string().min(8),
  religion: z.enum(['hindu', 'muslim', 'christian', 'sikh', 'jain', 'other']),
  dob: z.string(),
  checkInFrequency: z.enum(['weekly', 'fortnightly', 'monthly']).default('weekly'),
  encryptionSalt: z.string().optional(),
  keyCheck: z.string().optional(),
  consentGiven: z.boolean().default(false),
  consentAt: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const parsed = SignupSchema.safeParse(body)

    if (!parsed.success) {
      return badRequest(parsed.error.errors[0].message)
    }

    const { email, name, phone, password, religion, dob, checkInFrequency, encryptionSalt, keyCheck, consentGiven, consentAt } = parsed.data

    const existing = await User.findOne({ email })
    if (existing) return badRequest('Email already registered')

    if (!consentGiven) return badRequest('Consent is required to create an account')

    const passwordHash = await hashPassword(password)
    const saltToStore = encryptionSalt || generateSalt()

    const user = await User.create({
      email,
      name,
      phone,
      password: undefined, // not stored
      passwordHash,
      encryptionSalt: saltToStore,
      keyCheck: keyCheck || '',
      religion,
      dob,
      checkInFrequency,
      lastCheckIn: new Date(),
      missedCount: 0,
      status: 'active',
      consentGiven: true,
      consentAt: consentAt ? new Date(consentAt) : new Date(),
    })

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      encryptionSalt: user.encryptionSalt,
      keyCheck: user.keyCheck,
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
    }, 'Account created successfully')
  } catch (err) {
    console.error('Signup error:', err)
    return serverError(err)
  }
}
