import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { authCookie, signAuthToken } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-auth"
import { checkRateLimit } from "@/lib/rateLimiter"

const schema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().min(8).max(20),
  addressLine1: z.string().min(3).max(120),
  addressLine2: z.string().max(120).optional().nullable(),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  postalCode: z.string().min(4).max(12),
})

export async function POST(req: Request) {
  try {
    const rl = await checkRateLimit(req, "auth:register", 4, 60_000)
    if (!rl.allowed) {
      const retry = Math.ceil((rl.reset - Date.now()) / 1000)
      return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retry) } })
    }
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

    const { name, email, password, phone, addressLine1, addressLine2, city, state, postalCode } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        phone,
        addressLine1,
        addressLine2: addressLine2 ?? null,
        city,
        state,
        postalCode,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
      },
    })

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      isAdmin: isAdminEmail(user.email),
    })
    const res = NextResponse.json({ user })
    res.cookies.set(authCookie.name, token, authCookie.options)
    return res
  } catch (error) {
    console.error("auth/register POST error:", error)
    return NextResponse.json(
      { error: "Unable to create account right now" },
      { status: 500 },
    )
  }
}
