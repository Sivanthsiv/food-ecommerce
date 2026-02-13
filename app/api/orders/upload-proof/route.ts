import { createHash, randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  // WEBP files start with 'RIFF' then bytes then 'WEBP'
  "image/webp": [0x52, 0x49, 0x46, 0x46],
}

function getUploadOwnerKey(user: { userId?: string | null; email?: string | null }) {
  const base = String(user.userId ?? user.email ?? "anon").toLowerCase().trim()
  return createHash("sha256").update(base).digest("hex").slice(0, 16)
}

function getExtension(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    default:
      return "bin"
  }
}

function validateMagicBytes(buf: ArrayBuffer, mime: string) {
  const expected = MAGIC_BYTES[mime]
  if (!expected) return false
  const bytes = new Uint8Array(buf)
  if (bytes.length < expected.length) return false
  for (let i = 0; i < expected.length; i++) {
    if (bytes[i] !== expected[i]) return false
  }
  return true
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limit uploads per user/IP to deter spam or mass attempts
    try {
      const { checkRateLimit } = await import("@/lib/rateLimiter")
      const rl = await checkRateLimit(req, `orders:upload:${auth.userId ?? auth.email ?? "anon"}`, 6, 60_000)
      if (!rl.allowed) {
        const retry = Math.ceil((rl.reset - Date.now()) / 1000)
        return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retry) } })
      }
    } catch (_) {
      // no-op if rate limiter import fails
    }

    const formData = await req.formData()
    const file = formData.get("file")
    const orderId = String(formData.get("orderId") ?? "").trim()

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No screenshot uploaded" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WEBP files are allowed" },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Screenshot too large (max 5MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    if (!validateMagicBytes(bytes, file.type)) {
      return NextResponse.json({ error: "Uploaded file failed validation" }, { status: 400 })
    }

    const hasOrderId = Boolean(orderId)
    if (hasOrderId) {
      // Basic ObjectId validation to avoid accidental DB queries and leaks
      const objectIdPattern = /^[a-fA-F0-9]{24}$/
      if (!objectIdPattern.test(orderId)) {
        return NextResponse.json({ error: "Invalid orderId" }, { status: 400 })
      }

      // Verify order and ownership when uploading against an existing order
      const order = await prisma.order.findUnique({ where: { id: orderId } })
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
      const isOwner = order.userId ? order.userId === auth.userId : order.customerEmail === auth.email
      if (!isOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const ext = getExtension(file.type)
    const ownerKey = getUploadOwnerKey(auth)
    const prefix = hasOrderId ? "payment" : `tmp-${ownerKey}`
    const filename = `${prefix}-${Date.now()}-${randomUUID()}.${ext}`
    const targetDir = path.join(process.cwd(), "uploads", "payments")
    const targetPath = path.join(targetDir, filename)

    await mkdir(targetDir, { recursive: true })
    await writeFile(targetPath, Buffer.from(bytes))

    // Store a protected URL reference in the order (not a public static path)
    const protectedUrl = `/api/orders/proof/${filename}`
    if (hasOrderId) {
      try {
        await prisma.order.update({ where: { id: orderId }, data: { paymentScreenshotUrl: protectedUrl } })
      } catch (e) {
        // Non-fatal; log and continue
        console.error("Failed to update order with screenshot URL:", e)
      }
    }

    return NextResponse.json({ screenshotUrl: protectedUrl, temporary: !hasOrderId })
  } catch (err) {
    console.error("orders/upload-proof POST error:", err)
    return NextResponse.json({ error: "Unable to upload screenshot" }, { status: 500 })
  }
}
