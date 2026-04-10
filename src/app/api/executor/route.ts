export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { Executor } from '@/models/Executor'
import { getCurrentUser } from '@/lib/auth'
import { ok, created, unauthorized, serverError, badRequest } from '@/lib/api'
import { sendExecutorWelcomeEmail } from '@/lib/email'
import { generateSecureToken } from '@/lib/crypto'
import { z } from 'zod'

const ExecutorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  relationship: z.string().min(1),
})

export async function GET() {
  try {
    const user = getCurrentUser()
    if (!user) return unauthorized()
    await connectDB()
    const executor = await Executor.findOne({ userId: user.id }).lean()
    return ok(executor)
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user) return unauthorized()
    await connectDB()

    const body = await req.json()
    const parsed = ExecutorSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.errors[0].message)

    // Only one executor per user
    const existing = await Executor.findOne({ userId: user.id })
    if (existing) {
      // Update existing
      const updated = await Executor.findOneAndUpdate(
        { userId: user.id },
        { $set: parsed.data },
        { new: true }
      )
      return ok(updated, 'Executor updated')
    }

    const uniqueToken = generateSecureToken(48)
    const executor = await Executor.create({
      userId: user.id,
      ...parsed.data,
      uniqueToken,
      status: 'pending',
    })

    // Send welcome email to executor
    await sendExecutorWelcomeEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      ownerName: user.name,
    }).catch(console.error)

    return created(executor, 'Executor added. They have been notified by email.')
  } catch (err) {
    return serverError(err)
  }
}

