import mongoose from "mongoose"

function resolveMongoUri() {
  const rawUri = process.env.MONGO_URI ?? process.env.DATABASE_URL
  if (!rawUri) return null

  const dbPassword = process.env.MONGO_DB_PASSWORD
  const dbUser = process.env.MONGO_DB_USER

  let resolved = rawUri
  if (dbPassword) {
    resolved = resolved.replace("<db_password>", encodeURIComponent(dbPassword))
  }
  if (dbUser) {
    resolved = resolved.replace("<db_user>", encodeURIComponent(dbUser))
  }

  return resolved
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalWithMongoose = global as typeof globalThis & {
  mongooseCache?: MongooseCache
}

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = { conn: null, promise: null }
}

export async function connectDB() {
  const mongoUri = resolveMongoUri()

  if (!mongoUri) {
    const missingVars: string[] = []
    if (!process.env.MONGO_URI) missingVars.push("MONGO_URI")
    if (!process.env.DATABASE_URL) missingVars.push("DATABASE_URL")
    throw new Error(`Missing environment variable(s): ${missingVars.join(", ")}. Add them to your .env file.`)
  }

  if (mongoUri.includes("<") || mongoUri.includes(">")) {
    throw new Error(
      "MONGO_URI still contains placeholders. Set a full URI or add MONGO_DB_USER/MONGO_DB_PASSWORD.",
    )
  }

  const cache = globalWithMongoose.mongooseCache!

  if (cache.conn) {
    return cache.conn
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(mongoUri, {
        autoIndex: false,
        maxPoolSize: process.env.NODE_ENV === "production" ? 20 : 10,
        minPoolSize: process.env.NODE_ENV === "production" ? 2 : 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      })
      .catch((error) => {
        cache.promise = null
        throw error
      })
  }

  cache.conn = await cache.promise
  return cache.conn
}
