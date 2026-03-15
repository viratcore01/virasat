export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { Message } from '@/models/index'
import { getCurrentUser } from '@/lib/auth'
import { ok, created, unauthorized, serverError, badRequest } from '@/lib/api'
import { z } from 'zod'

const MessageSchema = z.object({
  type: z.enum(['video', 'letter', 'voice']),
  title: z.string().min(1).max(200),
  assignedTo: z.string().min(1),
  triggerType: z.enum(['on_death', 'on_date']),
  triggerDate: z.string().optional(),
  encryptedContentUrl: z.string().optional(),
  encryptedText: z.string().optional(),
})

export async function GET() {
  try {
    const user = getCurrentUser()
    if (!user) return unauthorized()
    await connectDB()
    const messages = await Message.find({ userId: user.id }).sort({ createdAt: -1 }).lean()
    return ok(messages)
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
    const parsed = MessageSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.errors[0].message)

    if (parsed.data.type === 'letter' && !parsed.data.encryptedText) {
      return badRequest('Letter content is required')
    }
    if ((parsed.data.type === 'video' || parsed.data.type === 'voice') && !parsed.data.encryptedContentUrl) {
      return badRequest('Media upload is required')
    }

    if (parsed.data.triggerType === 'on_date' && !parsed.data.triggerDate) {
      return badRequest('Trigger date is required for date-locked messages')
    }

    const message = await Message.create({
      userId: user.id,
      ...parsed.data,
      delivered: false,
    })

    return created(message, 'Message saved')
  } catch (err) {
    return serverError(err)
  }
}

