import { NextResponse } from "next/server"
import path from "path"
import { readFile } from "fs/promises"
import { createHash } from "crypto"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

function mimeFromExt(ext: string) {
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg"
    case "png":
      return "image/png"
    case "webp":
      return "image/webp"
    default:
      return "application/octet-stream"
  }
}

function getUploadOwnerKey(user: { userId?: string | null; email?: string | null }) {
  const base = String(user.userId ?? user.email ?? "anon").toLowerCase().trim()
  return createHash("sha256").update(base).digest("hex").slice(0, 16)
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = params?.id
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  // Basic filename validation to prevent path traversal and abuse
  const safeNamePattern = /^[a-zA-Z0-9\-_.]+\.[a-zA-Z0-9]{2,6}$/
  if (!safeNamePattern.test(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  const protectedUrl = `/api/orders/proof/${id}`
  try {
    const uploadsDir = path.join(process.cwd(), "uploads", "payments")
    const targetPath = path.join(uploadsDir, id)
    const ext = id.split(".").pop() ?? ""
    const mime = mimeFromExt(ext.toLowerCase())

    // Temporary files are uploaded before order creation. Restrict access to
    // only the same authenticated user (or admin).
    if (id.startsWith("tmp-")) {
      const expectedPrefix = `tmp-${getUploadOwnerKey(auth)}-`
      if (!auth.isAdmin && !id.startsWith(expectedPrefix)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const data = await readFile(targetPath)
      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": mime,
          "Cache-Control": "private, max-age=0",
        },
      })
    }

    const order = await prisma.order.findFirst({ where: { paymentScreenshotUrl: protectedUrl } })
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const isOwner = order.userId ? order.userId === auth.userId : order.customerEmail === auth.email
    const isAdmin = !!auth.isAdmin
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const data = await readFile(targetPath)

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, max-age=0",
      },
    })
  } catch (err) {
    console.error("orders/proof GET error:", err)
    return NextResponse.json({ error: "Unable to fetch file" }, { status: 500 })
  }
}
