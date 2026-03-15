export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { Message } from '@/models/index'
import { getCurrentUser } from '@/lib/auth'
import { ok, unauthorized, notFound, serverError } from '@/lib/api'

interface Params { params: { id: string } }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = getCurrentUser()
    if (!user) return unauthorized()
    await connectDB()
    const msg = await Message.findOneAndDelete({ _id: params.id, userId: user.id })
    if (!msg) return notFound()
    return ok(null, 'Message deleted')
  } catch (err) {
    return serverError(err)
  }
}
