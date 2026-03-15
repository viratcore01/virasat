export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { Executor } from '@/models/Executor'
import { User } from '@/models/User'
import { ExecutorRequest } from '@/models/index'
import { ok, notFound, serverError, badRequest } from '@/lib/api'
import { sendOwnerVaultTriggeredWhatsApp } from '@/lib/whatsapp'
import { addDays } from 'date-fns'
import { z } from 'zod'

interface Params { params: { token: string } }

// ─── GET executor info ────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const executor = await Executor.findOne({ uniqueToken: params.token })
    if (!executor) return notFound('Invalid executor link')

    const user = await User.findById(executor.userId)
      .select('name email status')
      .lean<{ name: string; email: string; status: string } | null>()
    if (!user) return notFound('User not found')

    return ok({
      executor: { name: executor.name, status: executor.status },
      owner: { name: user.name, status: user.status },
    })
  } catch (err) {
    return serverError(err)
  }
}

// ─── POST verify (death certificate upload) ───────────────────────────────────

const VerifySchema = z.object({
  action: z.enum(['verify', 'cancel']),
  deathCertificateUrl: z.string().optional(),
  dateOfDeath: z.string().optional(),
  cancellationReason: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const executor = await Executor.findOne({ uniqueToken: params.token })
    if (!executor) return notFound('Invalid executor link')

    const user = await User.findById(executor.userId)
    if (!user) return notFound('User not found')

    const body = await req.json()
    const parsed = VerifySchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.errors[0].message)

    const { action } = parsed.data

    if (action === 'cancel') {
      // False alarm — reset everything
      await User.updateOne({ _id: user._id }, {
        $set: { status: 'active', missedCount: 0, lastCheckIn: new Date() }
      })
      await Executor.updateOne({ _id: executor._id }, {
        $set: { status: 'pending' }
      })
      return ok(null, 'Vault trigger cancelled. Everything is back to normal.')
    }

    if (action === 'verify') {
      if (!parsed.data.deathCertificateUrl) {
        return badRequest('Death certificate is required for verification')
      }

      const unlockDate = addDays(new Date(), 30) // 30 day wait

      // Create executor request
      await ExecutorRequest.create({
        userId: user._id,
        executorId: executor._id,
        initiatedAt: new Date(),
        deathCertificateUrl: parsed.data.deathCertificateUrl,
        dateOfDeath: parsed.data.dateOfDeath,
        verifiedAt: new Date(),
        unlockDate,
        status: 'waiting',
      })

      // Update statuses
      await User.updateOne({ _id: user._id }, { $set: { status: 'verified_deceased' } })
      await Executor.updateOne({ _id: executor._id }, {
        $set: { status: 'verified', verifiedAt: new Date(), unlockDate }
      })

      // Send last-chance WhatsApp to owner (in case they're alive and phone is accessible)
      await sendOwnerVaultTriggeredWhatsApp({
        name: user.name,
        phone: user.phone,
      }).catch(console.error)

      return ok({ unlockDate }, `Verified. Vault will unlock on ${unlockDate.toDateString()}. A 30-day waiting period has begun.`)
    }

    return badRequest('Invalid action')
  } catch (err) {
    return serverError(err)
  }
}
