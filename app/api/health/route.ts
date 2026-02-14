import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export const dynamic = "force-dynamic"

function classifyDbError(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes("missing or invalid")) return "missing_or_invalid_mongo_uri"
  if (lower.includes("placeholders")) return "mongo_uri_placeholders_not_replaced"
  if (lower.includes("authentication failed") || lower.includes("bad auth")) return "mongo_auth_failed"
  if (lower.includes("server selection timed out")) return "mongo_network_unreachable"
  return "database_connection_failed"
}

export async function GET() {
  try {
    await connectDB()
    return NextResponse.json(
      {
        ok: true,
        app: "healthy",
        database: "connected",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("health check error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown server error"
    return NextResponse.json(
      {
        ok: false,
        app: "running",
        database: "disconnected",
        error: "Database error",
        reason: classifyDbError(errorMessage),
        message: errorMessage,
      },
      { status: 503 },
    )
  }
}
