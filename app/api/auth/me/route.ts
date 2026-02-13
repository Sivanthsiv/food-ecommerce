import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-auth"

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) {
    return NextResponse.json({ user: null })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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

    if (!user && isAdminEmail(payload.email)) {
      return NextResponse.json({
        user: {
          id: payload.userId,
          email: payload.email,
          name: "EasyKitchen Admin",
          isAdmin: true,
        },
      })
    }

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        ...user,
        isAdmin: isAdminEmail(user.email),
      },
    })
  } catch {
    console.error("auth/me GET error:")
    if (isAdminEmail(payload.email)) {
      return NextResponse.json({
        user: {
          id: payload.userId,
          email: payload.email,
          name: "EasyKitchen Admin",
          isAdmin: true,
        },
      })
    }
    return NextResponse.json({ user: null })
  }
}
