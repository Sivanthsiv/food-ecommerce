import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireAdminSession } from "@/lib/admin-auth"

const productSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  slug: z.string().min(2).max(140).optional(),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().min(2).max(60).optional(),
  pricePaise: z.number().int().positive().optional(),
  imageUrl: z.string().max(500).optional().nullable(),
  isVeg: z.boolean().optional(),
  spiceLevel: z.string().max(20).optional().nullable(),
  weight: z.string().max(40).optional().nullable(),
  shelfLife: z.string().max(40).optional().nullable(),
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
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    })
    return NextResponse.json({ product })
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to update product. Check DATABASE_URL and ensure the database is running.",
      },
      { status: 503 },
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (auth) return auth

  const { id } = await params

  try {
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to delete product. Check DATABASE_URL and ensure the database is running.",
      },
      { status: 503 },
    )
  }
}
