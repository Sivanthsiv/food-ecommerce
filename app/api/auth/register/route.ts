import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { authCookie, signAuthToken } from "@/lib/auth"

const schema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export async function POST(req: Request) {
  try {
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error: JWT_SECRET is not set" },
        { status: 500 },
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true },
    })

    const token = signAuthToken({ userId: user.id, email: user.email })
    const res = NextResponse.json({ user })
    res.cookies.set(authCookie.name, token, authCookie.options)
    return res
  } catch {
    return NextResponse.json({ error: "Unable to create account right now" }, { status: 500 })
  }
}
