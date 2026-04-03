export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { connectDB } from '@/lib/db'
import { Message } from '@/models/index'
import { getCurrentUser } from '@/lib/auth'
import { ok, unauthorized, notFound, serverError, badRequest } from '@/lib/api'

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = getCurrentUser()
    if (!user) return unauthorized()
    await connectDB()

    const msg = await Message.findOne({ _id: params.id, userId: user.id }).lean()
    if (!msg) return notFound()
    if (msg.type !== 'video' && msg.type !== 'voice') return badRequest('Not a media message')
    if (!msg.encryptedContentUrl) return badRequest('No media attached')

    const accountId = process.env.R2_ACCOUNT_ID
    const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined)
    const bucket = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
      return badRequest('R2 is not configured')
    }

    let key = msg.encryptedContentUrl
    if (key.startsWith('http')) {
      try {
        key = new URL(key).pathname.replace(/^\/+/, '')
      } catch {
        return badRequest('Invalid media URL')
      }
    }

    const client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    })

    const command = new GetObjectCommand({ Bucket: bucket, Key: key })
    const url = await getSignedUrl(client, command, { expiresIn: 600 })

    return ok({ url })
  } catch (err) {
    return serverError(err)
  }
}

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
