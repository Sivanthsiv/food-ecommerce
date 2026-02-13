import { connectDB } from "@/lib/mongodb"
import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin-auth"

export async function GET(req: Request) {
  // Require admin session for this diagnostic endpoint
  const auth = await requireAdminSession()
  if (auth) return auth

  try {
    await connectDB()
     return NextResponse.json({ message: "Database connection successful" })
  } catch (error) {
     console.error("admin/test DB connection error:", error)
     return NextResponse.json({ error: "Unable to connect to database" }, { status: 503 })
  }
}
