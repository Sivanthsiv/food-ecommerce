import mongoose from "mongoose"

function normalizeEnvValue(value: string | undefined) {
  if (!value) return ""
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

function isMongoConnectionString(value: string) {
  return value.startsWith("mongodb://") || value.startsWith("mongodb+srv://")
}

function resolveMongoUri() {
  const rawMongoUri = normalizeEnvValue(process.env.MONGO_URI)
  const fallbackDatabaseUrl = normalizeEnvValue(process.env.DATABASE_URL)
  const rawUri = rawMongoUri || fallbackDatabaseUrl
  if (!rawUri) return null

  if (!isMongoConnectionString(rawUri)) {
    return null
  }

  const dbPassword = normalizeEnvValue(process.env.MONGO_DB_PASSWORD)
  const dbUser = normalizeEnvValue(process.env.MONGO_DB_USER)

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
    throw new Error(
      "MongoDB URI is missing or invalid. Set MONGO_URI to a mongodb:// or mongodb+srv:// connection string.",
    )
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
