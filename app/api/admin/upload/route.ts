import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin-auth"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

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

    const ext = getExtension(file.type)
    const filename = `${Date.now()}-${randomUUID()}.${ext}`
    const relativePath = `/uploads/${filename}`
    const targetDir = path.join(process.cwd(), "public", "uploads")
    const targetPath = path.join(targetDir, filename)

    await mkdir(targetDir, { recursive: true })
    const bytes = await file.arrayBuffer()
    await writeFile(targetPath, Buffer.from(bytes))

    return NextResponse.json({ imageUrl: relativePath })
  } catch {
    return NextResponse.json({ error: "Unable to upload image" }, { status: 500 })
  }
}
