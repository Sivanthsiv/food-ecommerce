import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin-auth"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
  "image/gif": [0x47, 0x49, 0x46, 0x38],
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

function getExtension(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    default:
      return "bin"
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminSession()
  if (auth) return auth

  try {
    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP, and GIF files are allowed" },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    if (!validateMagicBytes(bytes, file.type)) {
      return NextResponse.json({ error: "Uploaded file failed validation" }, { status: 400 })
    }

    const ext = getExtension(file.type)
    const filename = `${Date.now()}-${randomUUID()}.${ext}`
    const relativePath = `/uploads/${filename}`
    const targetDir = path.join(process.cwd(), "public", "uploads")
    const targetPath = path.join(targetDir, filename)

    await mkdir(targetDir, { recursive: true })
    await writeFile(targetPath, Buffer.from(bytes))

    return NextResponse.json({ imageUrl: relativePath })
  } catch (err) {
    console.error("admin/upload POST error:", err)
    return NextResponse.json({ error: "Unable to upload image" }, { status: 500 })
  }
}
