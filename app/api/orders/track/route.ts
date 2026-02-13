import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"

const querySchema = z.object({
  orderId: z.string().min(6).max(40),
  email: z.string().email(),
})

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = querySchema.safeParse({
    orderId: body?.orderId ?? "",
    email: body?.email ?? "",
  })

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order ID or email" }, { status: 400 })
  }

  const { orderId, email } = parsed.data

  try {
    const looksLikeObjectId = /^[a-fA-F0-9]{24}$/.test(orderId)
    const order = await prisma.order.findUnique({
      where: looksLikeObjectId ? { id: orderId } : { orderNumber: orderId.toUpperCase() },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentRemark: true,
        paymentSubmittedAt: true,
        paymentVerifiedAt: true,
        customerName: true,
        customerEmail: true,
        createdAt: true,
        totalPaise: true,
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            pricePaise: true,
          },
        },
      },
    })

    if (!order || typeof order.customerEmail !== "string" || order.customerEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (err) {
    console.error("orders/track POST error:", err)
    return NextResponse.json(
      { error: "Unable to track order right now. Please try again shortly." },
      { status: 503 },
    )
  }
}
