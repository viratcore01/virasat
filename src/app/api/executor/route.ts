export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { Executor } from '@/models/Executor'
import { getCurrentUser } from '@/lib/auth'
import { ok, created, unauthorized, serverError, badRequest } from '@/lib/api'
import { sendExecutorWelcomeEmail } from '@/lib/email'
import { generateSecureToken } from '@/lib/crypto'
import { z } from 'zod'
import { ExecutorRole } from '@/types'
import { User } from '@/models/User'

const ExecutorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  relationship: z.string().min(1),
  role: z.enum(['primary', 'backup']).default('primary'),
  order: z.number().min(0).max(2).optional(),
})

export async function GET() {
  try {
    const user = getCurrentUser()
    if (!user) return unauthorized()
    await connectDB()
    const executors = await Executor.find({ userId: user.id }).sort({ order: 1, createdAt: 1 }).lean()
    return ok(executors)
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return unauthorized()
    await connectDB()

    const userDoc = await User.findById(currentUser.id).lean()
    const user = userDoc as any
    if (!user) return badRequest('User not found')

    const body = await req.json()
    const parsed = ExecutorSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.errors[0].message)

    const existing = await Executor.find({ userId: user._id }).sort({ order: 1, createdAt: 1 }).lean()
    const primaryCount = existing.filter(e => e.role === 'primary').length

    if (parsed.data.role === 'primary' && primaryCount >= 1) {
      return badRequest('Only one primary executor is allowed. Use backup role for additional executors.')
    }

    if (existing.length >= user.maxExecutors) {
      return badRequest(`Maximum ${user.maxExecutors} executors allowed.`)
    }

    const order = parsed.data.order ?? existing.length

    const uniqueToken = generateSecureToken(48)
    const executor = await Executor.create({
      userId: user._id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      relationship: parsed.data.relationship,
      role: parsed.data.role,
      order,
      uniqueToken,
      status: 'pending',
    })

    await sendExecutorWelcomeEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      ownerName: user.name,
    }).catch(console.error)

    return created(executor, 'Executor added successfully.')
  } catch (err) {
    return serverError(err)
  }
}

