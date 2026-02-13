import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireAdminSession } from "@/lib/admin-auth"

const schema = z.object({
  status: z.string().min(2).max(30).optional(),
  paymentStatus: z.enum(["pending_review", "approved", "rejected"]).optional(),
  paymentRemark: z.string().max(300).optional(),
}).refine((value) => Boolean(value.status || value.paymentStatus), {
  message: "Nothing to update",
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (auth) return auth

  const { id } = await params
  const objectIdPattern = /^[a-fA-F0-9]{24}$/
  if (!objectIdPattern.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const updateData: {
      status?: string
      paymentStatus?: string
      paymentRemark?: string
      paymentVerifiedAt?: Date | null
    } = {}

    if (parsed.data.status) {
      updateData.status = parsed.data.status
    }

    if (parsed.data.paymentStatus) {
      updateData.paymentStatus = parsed.data.paymentStatus
      if (parsed.data.paymentStatus === "approved") {
        updateData.paymentVerifiedAt = new Date()
        if (!updateData.status) updateData.status = "confirmed"
      }
      if (parsed.data.paymentStatus === "rejected") {
        updateData.paymentVerifiedAt = null
        if (!updateData.status) updateData.status = "payment_rejected"
      }
    }

    if (parsed.data.paymentRemark !== undefined) {
      updateData.paymentRemark = parsed.data.paymentRemark
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json({ order })
  } catch (err) {
    console.error("admin/orders/[id] PUT error:", err)
    return NextResponse.json({ error: "Unable to update order" }, { status: 503 })
  }
}
