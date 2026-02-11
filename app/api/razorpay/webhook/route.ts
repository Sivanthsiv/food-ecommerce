import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyRazorpayWebhook } from "@/lib/razorpay"

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  const bodyText = await req.text()
  const isValid = verifyRazorpayWebhook(bodyText, signature)
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const payload = JSON.parse(bodyText) as {
    event: string
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string } }
      order?: { entity?: { id?: string } }
    }
  }

  const paymentId = payload.payload?.payment?.entity?.id
  const orderId = payload.payload?.payment?.entity?.order_id ?? payload.payload?.order?.entity?.id

  if (!orderId) {
    return NextResponse.json({ ok: true })
  }

  if (payload.event === "payment.captured" || payload.event === "order.paid") {
    await prisma.order.updateMany({
      where: { razorpayOrderId: orderId },
      data: {
        status: "paid",
        razorpayPaymentId: paymentId ?? undefined,
      },
    })
  }

  return NextResponse.json({ ok: true })
}
