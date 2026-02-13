import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyRazorpayWebhook, getRazorpayClient } from "@/lib/razorpay"
import { appendFile, mkdir } from "fs/promises"
import path from "path"

async function auditLog(line: string) {
  try {
    const dir = path.join(process.cwd(), "logs")
    await mkdir(dir, { recursive: true })
    const file = path.join(dir, "payment-audit.log")
    await appendFile(file, line + "\n")
  } catch (e) {
    console.error("Failed to write audit log:", e)
  }
}

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

  // Nothing to do if we couldn't correlate to an order id
  if (!orderId) {
    await auditLog(`${new Date().toISOString()} | webhook | no-order-id | event=${payload.event}`)
    return NextResponse.json({ ok: true })
  }

  // Handle relevant events
  if (payload.event === "payment.captured" || payload.event === "order.paid") {
    try {
      // If we have a payment id, confirm with Razorpay API to avoid spoofed webhooks
      let paymentStatus = "unknown"
      let fetchedPayment: any = null
      if (paymentId) {
        try {
          const client = getRazorpayClient()
          fetchedPayment = await client.payments.fetch(paymentId)
          paymentStatus = fetchedPayment?.status ?? paymentStatus
        } catch (e) {
          console.error("Failed to fetch payment from Razorpay:", e)
        }
      }

      // Only mark as paid when payment appears captured/authorized
      const isCaptured = (paymentStatus === "captured") || payload.event === "order.paid"
      if (isCaptured) {
        const updated = await prisma.order.updateMany({
          where: { razorpayOrderId: orderId, status: { not: "paid" } },
          data: {
            status: "paid",
            razorpayPaymentId: paymentId ?? undefined,
          },
        })

        await auditLog(`${new Date().toISOString()} | payment-verified | order=${orderId} | payment=${paymentId} | status=${paymentStatus} | updated=${updated.count}`)
      } else {
        await auditLog(`${new Date().toISOString()} | payment-ignored | order=${orderId} | payment=${paymentId} | status=${paymentStatus}`)
      }
    } catch (err) {
      console.error("razorpay webhook processing error:", err)
      await auditLog(`${new Date().toISOString()} | webhook-error | order=${orderId} | err=${String(err)}`)
    }
  }

  return NextResponse.json({ ok: true })
}
