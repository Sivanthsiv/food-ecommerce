import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireAdminSession } from "@/lib/admin-auth"

const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  description: z.string().max(2000).optional(),
  category: z.string().min(2).max(60),
  pricePaise: z.number().int().positive(),
  imageUrl: z.string().max(500).optional(),
  isVeg: z.boolean().optional(),
  spiceLevel: z.string().max(20).optional(),
  weight: z.string().max(40).optional(),
  shelfLife: z.string().max(40).optional(),
})

export async function GET(req: Request) {
  const auth = await requireAdminSession()
  if (auth) return auth

  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } })
    return NextResponse.json({ products })
  } catch (error) {
    console.error("admin/products GET error:", error)
    return NextResponse.json(
      { error: "Unable to load products; please try again later." },
      { status: 503 },
    )
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminSession()
  if (auth) return auth

  try {
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const product = await prisma.product.create({ data: parsed.data })
    return NextResponse.json({ product })
  } catch (error) {
    console.error("admin/products POST error:", error)
    return NextResponse.json(
      { error: "Unable to create product. Please try again later." },
      { status: 503 },
    )
  }
}
