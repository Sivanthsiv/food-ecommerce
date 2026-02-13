import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { OrderModel } from "@/lib/models"

const schema = z.object({
  orderId: z.string().regex(/^[a-fA-F0-9]{24}$/),
  itemId: z.string().regex(/^[a-fA-F0-9]{24}$/),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(2).max(500),
})

export async function POST(req: Request) {
  const auth = await getAuthUser()
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { orderId, itemId, rating, comment } = parsed.data

    await connectDB()
    const order = await OrderModel.findById(orderId).lean()
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const isOwner =
      (order.userId && String(order.userId) === auth.userId) ||
      String(order.customerEmail).toLowerCase() === auth.email.toLowerCase()

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (String(order.status) !== "delivered") {
      return NextResponse.json({ error: "Reviews are allowed only for delivered orders" }, { status: 400 })
    }

    const item = (order.items ?? []).find((i: any) => String(i._id) === itemId)
    if (!item) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    await OrderModel.updateOne(
      { _id: orderId, "items._id": itemId },
      {
        $set: {
          "items.$.reviewRating": rating,
          "items.$.reviewComment": comment.trim(),
          "items.$.reviewCreatedAt": new Date(),
        },
      },
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown server error"
    return NextResponse.json({ error: "Unable to submit review", details }, { status: 500 })
  }
}
