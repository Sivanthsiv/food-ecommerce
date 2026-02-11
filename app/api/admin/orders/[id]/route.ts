import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireAdminSession } from "@/lib/admin-auth"

const schema = z.object({
  status: z.string().min(2).max(30),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (auth) return auth

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
    })
    return NextResponse.json({ order })
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to update order. Check DATABASE_URL and ensure the database is running.",
      },
      { status: 503 },
    )
  }
}
