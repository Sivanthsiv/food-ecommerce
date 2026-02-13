import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { authCookie, signAuthToken } from "@/lib/auth"
import { getAdminPassword, isAdminEmail } from "@/lib/admin-auth"
import { checkRateLimit } from "@/lib/rateLimiter"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export async function POST(req: Request) {
  try {
    // Basic rate limit by IP + endpoint to prevent brute force
    const rl = await checkRateLimit(req, "auth:login", 8, 60_000)
    if (!rl.allowed) {
      const retry = Math.ceil((rl.reset - Date.now()) / 1000)
      return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retry) } })
    }
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const email = parsed.data.email.trim().toLowerCase()
    const { password } = parsed.data
    const adminLogin = isAdminEmail(email)

    // Admin login should not fail just because DB is unavailable.
    if (adminLogin) {
      if (password !== getAdminPassword()) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      let adminUserId = "admin"
      try {
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
          const matches = await bcrypt.compare(password, existing.passwordHash)
          if (!matches) {
            await prisma.user.update({
              where: { id: existing.id },
              data: { passwordHash: await bcrypt.hash(password, 10) },
            })
          }
          adminUserId = existing.id
        } else {
          const created = await prisma.user.create({
            data: {
              email,
              name: "EasyKitchen Admin",
              passwordHash: await bcrypt.hash(password, 10),
            },
          })
          adminUserId = created.id
        }
      } catch {
        // Continue with JWT-only admin session if database is down.
      }

      const token = signAuthToken({
        userId: adminUserId,
        email,
        name: "EasyKitchen Admin",
        isAdmin: true,
      })
      const res = NextResponse.json({
        user: {
          id: adminUserId,
          email,
          name: "EasyKitchen Admin",
          isAdmin: true,
        },
      })
      res.cookies.set(authCookie.name, token, authCookie.options)
      return res
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      isAdmin: isAdminEmail(user.email),
    })
    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: isAdminEmail(user.email),
      },
    })
    res.cookies.set(authCookie.name, token, authCookie.options)
    return res
  } catch (error) {
    console.error("auth/login POST error:", error)
    return NextResponse.json(
      { error: "Unable to login right now. Please try again later." },
      { status: 503 },
    )
  }
}
