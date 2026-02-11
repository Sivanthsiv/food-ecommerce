import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { getRazorpayClient } from "@/lib/razorpay"

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(99),
      })
    )
    .min(1),
  customer: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    phone: z.string().min(8).max(20),
  }),
  address: z.object({
    line1: z.string().min(3).max(120),
    line2: z.string().max(120).optional(),
    city: z.string().min(2).max(60),
    state: z.string().min(2).max(60),
    postalCode: z.string().min(4).max(12),
  }),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { items, customer, address } = parsed.data

  const productIds = items.map((i) => i.productId)
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  if (dbProducts.length !== productIds.length) {
    return NextResponse.json({ error: "Some products not found" }, { status: 400 })
  }

  const itemRows = items.map((item) => {
    const product = dbProducts.find((p) => p.id === item.productId)
    if (!product) {
      throw new Error("Product not found")
    }
    return {
      productId: product.id,
      name: product.name,
      pricePaise: product.pricePaise,
      quantity: item.quantity,
    }
  })

  const subtotalPaise = itemRows.reduce(
    (sum, row) => sum + row.pricePaise * row.quantity,
    0
  )
  const shippingPaise = subtotalPaise >= 50000 ? 0 : 4900
  const taxPaise = 0
  const totalPaise = subtotalPaise + shippingPaise + taxPaise

  const order = await prisma.order.create({
    data: {
      subtotalPaise,
      shippingPaise,
      taxPaise,
      totalPaise,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      addressLine1: address.line1,
      addressLine2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      items: {
        create: itemRows,
      },
    },
  })

  const razorpay = getRazorpayClient()
  const razorpayOrder = await razorpay.orders.create({
    amount: totalPaise,
    currency: "INR",
    receipt: `order_${order.id}`,
  })

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: razorpayOrder.id },
  })

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: totalPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID ?? "",
  })
}
