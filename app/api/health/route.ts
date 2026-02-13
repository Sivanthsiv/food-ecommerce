import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

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
    return NextResponse.json(
      {
        ok: false,
        app: "running",
        database: "disconnected",
        error: "Database error",
      },
      { status: 503 },
    )
  }
}
