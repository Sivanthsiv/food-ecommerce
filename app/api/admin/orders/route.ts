import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdminSession } from "@/lib/admin-auth"

export async function GET(req: Request) {
  const auth = await requireAdminSession()
  if (auth) return auth

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("admin/orders GET error:", error)
    return NextResponse.json({ error: "Unable to load orders right now" }, { status: 503 })
  }
}
