import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const TOKEN_NAME = "ek_token"

export type AuthPayload = {
  userId: string
  email: string
  name?: string | null
  isAdmin?: boolean
}

export function signAuthToken(payload: AuthPayload) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not set")
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" })
}

export function verifyAuthToken(token: string): AuthPayload | null {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not set")
  }
  try {
    return jwt.verify(token, secret) as AuthPayload
  } catch {
    return null
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  if (!token) return null
  return verifyAuthToken(token)
}

export const authCookie = {
  name: TOKEN_NAME,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
}
