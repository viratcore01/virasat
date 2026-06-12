import mongoose from 'mongoose'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }
global.mongooseCache = cached

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI || MONGODB_URI === 'your_value_here' || MONGODB_URI.includes('placeholder')) {
    const hint = process.env.NEXT_PUBLIC_FREE_ONLY === 'true'
      ? 'Set a real MongoDB Atlas URI in .env.local, or run a local MongoDB instance.'
      : 'Set a real MongoDB Atlas URI in .env.local and redeploy.'

    throw new Error(
      `MongoDB URI is not configured or is a placeholder.\n${hint}\n` +
      'Get a free MongoDB Atlas connection string at: https://mongodb.com/atlas'
    )
  }

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    }).catch(err => {
      const isDnsErr = /querySrv ENOTFOUND|ECONNREFUSED|getaddrinfo ENOTFOUND/i.test(err.message || '')
      const tip = isDnsErr
        ? 'DNS lookup failed. Check your MongoDB Atlas cluster hostname, network, and IP allowlist.'
        : 'Verify MongoDB URI, credentials, IP whitelist, and network access.'

      console.error('MongoDB connection error:', err.message)
      throw new Error(
        `Failed to connect to MongoDB: ${err.message}\n${tip}`
      )
    })
  }

  try {
    cached.conn = await cached.promise
    console.log('✅ MongoDB connected successfully')
    return cached.conn
  } catch (error) {
    cached.promise = null
    throw error
  }
}
