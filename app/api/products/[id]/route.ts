import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const objectIdPattern = /^[a-fA-F0-9]{24}$/
  if (!objectIdPattern.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  try {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ product })
  } catch (err) {
    console.error("products/[id] GET error:", err)
    return NextResponse.json({ error: "Unable to load product" }, { status: 500 })
  }
}
