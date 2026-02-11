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
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to load orders. Check DATABASE_URL and ensure the database is running.",
      },
      { status: 503 },
    )
  }
}
