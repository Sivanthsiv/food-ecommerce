import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const objectIdPattern = /^[a-fA-F0-9]{24}$/
    const byUserId = objectIdPattern.test(auth.userId)
      ? await prisma.order.findMany({
          where: { userId: auth.userId },
          orderBy: { createdAt: "desc" },
          include: { items: true },
        })
      : []
    const byEmail = await prisma.order.findMany({
      where: { customerEmail: auth.email },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    })

    const merged = [...byUserId, ...byEmail]
    const deduped = Array.from(new Map(merged.map((order) => [order.id, order])).values())
    deduped.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))

    return NextResponse.json({ orders: deduped })
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown server error"
    return NextResponse.json({ error: "Unable to load your orders", details }, { status: 503 })
  }
}
