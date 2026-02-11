import Razorpay from "razorpay"
import crypto from "crypto"

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not set")
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export function verifyRazorpayWebhook(body: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not set")
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")
  return expected === signature
}
