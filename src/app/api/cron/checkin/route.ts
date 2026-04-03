export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Executor } from '@/models/Executor'
import { CheckIn } from '@/models/index'
import { sendCheckinEmail, sendMissedCheckinEmail, sendEmergencyContactEmail, sendExecutorTriggerEmail } from '@/lib/email'
import { generateSecureToken } from '@/lib/crypto'
import { ok, serverError } from '@/lib/api'
import { subDays, addDays } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    const isVercelCron = req.headers.get('x-vercel-cron') === '1'
    const hasSecret = authHeader === `Bearer ${process.env.CRON_SECRET}`
    if (!isVercelCron && !hasSecret) {
      return new Response('Unauthorized', { status: 401 })
    }

    await connectDB()
    const now = new Date()
    const results = { processed: 0, pinged: 0, miss1: 0, miss2: 0, miss3: 0, errors: 0 }

    // Get all active users not in snooze
    const users = await User.find({
      status: 'active',
      $or: [
        { snoozeUntil: { $exists: false } },
        { snoozeUntil: { $lt: now } }
      ]
    }).lean()

    for (const user of users) {
      try {
        results.processed++

        const freq = user.checkInFrequency
        const daysSinceLastCheckIn = Math.floor(
          (now.getTime() - new Date(user.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24)
        )

        const dueDays = freq === 'weekly' ? 7 : freq === 'fortnightly' ? 14 : 30

        // Not due yet
        if (daysSinceLastCheckIn < dueDays) continue

        // How many periods missed
        const periodsOverdue = Math.floor(daysSinceLastCheckIn / dueDays)
        const newMissedCount = Math.max(user.missedCount, periodsOverdue)

        await User.updateOne({ _id: user._id }, { $set: { missedCount: newMissedCount } })

        if (newMissedCount === 0) {
          // Send regular check-in ping
          const token = generateSecureToken(32)
          await CheckIn.create({
            userId: user._id,
            token,
            scheduledFor: now,
            missed: false,
          })

          const userData = { name: user.name, phone: user.phone, email: user.email, token }
          await Promise.allSettled([
            sendCheckinEmail(userData),
          ])
          results.pinged++

        } else if (newMissedCount === 1) {
          // Send urgent reminder
          const token = generateSecureToken(32)
          await CheckIn.create({ userId: user._id, token, scheduledFor: now, missed: true })

          await Promise.allSettled([
            sendMissedCheckinEmail({ name: user.name, email: user.email, token, missCount: 1 }),
          ])
          results.miss1++

        } else if (newMissedCount === 2) {
          // Contact emergency person
          // For MVP: use executor as emergency contact
          const executor = await Executor.findOne({ userId: user._id })
          if (executor) {
            await Promise.allSettled([
              sendEmergencyContactEmail({
                name: executor.name,
                email: executor.email,
                ownerName: user.name,
                ownerPhone: user.phone,
                appUrl: process.env.NEXT_PUBLIC_APP_URL!,
              }),
            ])
          }
          results.miss2++

        } else if (newMissedCount >= 3) {
          // Trigger executor — change status
          if (user.status === 'active') {
            await User.updateOne(
              { _id: user._id },
              { $set: { status: 'pending_verification' } }
            )

            const executor = await Executor.findOne({ userId: user._id })
            if (executor) {
              await Executor.updateOne(
                { _id: executor._id },
                { $set: { status: 'notified', notifiedAt: now } }
              )

              await Promise.allSettled([
                sendExecutorTriggerEmail({
                  name: executor.name,
                  email: executor.email,
                  ownerName: user.name,
                  token: executor.uniqueToken,
                }),
              ])
            }
          }
          results.miss3++
        }
      } catch (userErr) {
        console.error(`Error processing user ${user._id}:`, userErr)
        results.errors++
      }
    }

    console.log('Cron check-in results:', results)
    return ok(results, 'Cron job completed')
  } catch (err) {
    return serverError(err)
  }
}
