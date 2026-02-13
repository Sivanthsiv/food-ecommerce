import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { authCookie, getAuthUser, signAuthToken } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-auth"

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, "Enter a valid phone number"),
  addressLine1: z.string().trim().max(120).optional().nullable(),
  addressLine2: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().max(60).optional().nullable(),
  state: z.string().trim().max(60).optional().nullable(),
  postalCode: z.string().trim().max(12).optional().nullable(),
})

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  try {
    const user =
      (await prisma.user.findUnique({
        where: { id: auth.userId },
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
      })) ??
      (await prisma.user.findUnique({
        where: { email: auth.email },
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
      }))

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...user,
        isAdmin: isAdminEmail(user.email),
      },
    })
  } catch (error) {
    console.error("auth/profile GET error:", error)
    return NextResponse.json({ error: "Unable to load profile" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const auth = await getAuthUser()
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let body: any
    try {
      body = await req.json()
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const nextEmail = parsed.data.email.trim().toLowerCase()
    const nextName = parsed.data.name.trim()
    const nextPhone = parsed.data.phone.trim()

    const currentById = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, email: true, name: true },
    })
    const current =
      currentById ??
      (await prisma.user.findUnique({
        where: { email: auth.email },
        select: { id: true, email: true, name: true },
      }))

    if (!current) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (current.email !== nextEmail) {
      const existing = await prisma.user.findUnique({ where: { email: nextEmail } })
      if (existing && existing.id !== current.id) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 })
      }
    }

    const user = await prisma.user.update({
      where: { id: current.id },
      data: {
        name: nextName,
        email: nextEmail,
        phone: nextPhone,
        addressLine1: parsed.data.addressLine1?.trim() || null,
        addressLine2: parsed.data.addressLine2?.trim() || null,
        city: parsed.data.city?.trim() || null,
        state: parsed.data.state?.trim() || null,
        postalCode: parsed.data.postalCode?.trim() || null,
      },
    })

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      isAdmin: isAdminEmail(user.email),
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        isAdmin: isAdminEmail(user.email),
      },
    })
    response.cookies.set(authCookie.name, token, authCookie.options)
    return response
  } catch (error) {
    console.error("auth/profile PUT error:", error)
    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 })
  }
}
