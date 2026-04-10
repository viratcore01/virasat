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

  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not defined. Please set it in your environment variables.\n' +
      'Get a free MongoDB Atlas connection string at: https://mongodb.com/atlas'
    )
  }

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
    }).catch(err => {
      console.error('MongoDB connection error:', err.message)
      throw new Error(
        `Failed to connect to MongoDB: ${err.message}\n` +
        'Please check your MONGODB_URI and network connection.'
      )
    })
  }

  try {
    cached.conn = await cached.promise
    console.log('✅ MongoDB connected successfully')
    return cached.conn
  } catch (error) {
    cached.promise = null // Reset on failure so we can retry
    throw error
  }
}
