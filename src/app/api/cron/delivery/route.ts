export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import { Beneficiary, ExecutorRequest, Message } from '@/models/index'
import { User } from '@/models/User'
import { ok, serverError } from '@/lib/api'
import { sendFinalMessageDeliveryEmail } from '@/lib/email'

type OwnerLean = { _id: { toString: () => string }; name: string }
type BeneficiaryLean = {
  _id: { toString: () => string }
  name: string
  email: string
  phone: string
  relationship: string
  deliveryToken?: string
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const isVercelCron = req.headers.get('x-vercel-cron') === '1'
    const hasSecret = authHeader === `Bearer ${process.env.CRON_SECRET}`
    if (!isVercelCron && !hasSecret) {
      return new Response('Unauthorized', { status: 401 })
    }

    await connectDB()
    const now = new Date()

    const results = {
      unlockedUsers: 0,
      deliveredOnDate: 0,
      deliveredOnDeath: 0,
      notifications: 0,
      errors: 0,
    }

    const onDateMessages = await Message.find({
      delivered: false,
      triggerType: 'on_date',
      triggerDate: { $lte: now },
    }).lean()

    if (onDateMessages.length) {
      results.deliveredOnDate = onDateMessages.length
    }

    const unlocks = await ExecutorRequest.find({
      status: 'waiting',
      unlockDate: { $lte: now },
    }).lean()

    const unlockUserIds = unlocks.map(r => r.userId)

    const onDeathMessages = unlockUserIds.length
      ? await Message.find({
        delivered: false,
        triggerType: 'on_death',
        userId: { $in: unlockUserIds },
      }).lean()
      : []

    if (onDeathMessages.length) {
      results.deliveredOnDeath = onDeathMessages.length
    }

    if (unlocks.length) {
      results.unlockedUsers = unlocks.length
      await ExecutorRequest.updateMany(
        { _id: { $in: unlocks.map(r => r._id) } },
        { $set: { status: 'delivered' } }
      )
      await User.updateMany(
        { _id: { $in: unlockUserIds } },
        { $set: { status: 'delivered' } }
      )
    }

    const allMessages = [...onDateMessages, ...onDeathMessages]
    if (!allMessages.length) {
      return ok(results, 'No deliveries due')
    }

    await Message.updateMany(
      { _id: { $in: allMessages.map(m => m._id) } },
      { $set: { delivered: true, deliveredAt: now } }
    )

    const beneficiaryIds = Array.from(new Set(allMessages.map(m => m.assignedTo.toString())))
    const userIds = Array.from(new Set(allMessages.map(m => m.userId.toString())))

    const [beneficiaries, owners] = await Promise.all([
      Beneficiary.find({ _id: { $in: beneficiaryIds } }).lean<BeneficiaryLean[]>(),
      User.find({ _id: { $in: userIds } }).select('name').lean<OwnerLean[]>(),
    ])

    const ownerById = new Map(owners.map(o => [o._id.toString(), o.name]))
    const beneficiaryById = new Map(beneficiaries.map(b => [b._id.toString(), b]))

    const grouped = new Map<string, { beneficiary: any; ownerName: string; messages: any[] }>()

    for (const msg of allMessages) {
      const ben = beneficiaryById.get(msg.assignedTo.toString())
      if (!ben) continue
      const ownerName = ownerById.get(msg.userId.toString()) || 'Virasat user'
      const entry = grouped.get(ben._id.toString()) || { beneficiary: ben, ownerName, messages: [] }
      entry.messages.push(msg)
      grouped.set(ben._id.toString(), entry)
    }

    for (const entry of Array.from(grouped.values())) {
      try {
        let token = entry.beneficiary.deliveryToken
        if (!token) {
          token = crypto.randomBytes(32).toString('base64url')
          await Beneficiary.updateOne({ _id: entry.beneficiary._id }, { $set: { deliveryToken: token } })
        }

        const deliveryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/delivery/${token}`
        const count = entry.messages.length

        await Promise.allSettled([
          sendFinalMessageDeliveryEmail({
            name: entry.beneficiary.name,
            email: entry.beneficiary.email,
            ownerName: entry.ownerName,
            deliveryUrl,
            count,
          })
        ])
        results.notifications++
      } catch (err) {
        console.error('Delivery notification error:', err)
        results.errors++
      }
    }

    return ok(results, 'Delivery cron complete')
  } catch (err) {
    return serverError(err)
  }
}
