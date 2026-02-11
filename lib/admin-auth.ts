import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

const DEFAULT_ADMIN_EMAIL = "easykitchen1980@gmail.com"
const DEFAULT_ADMIN_PASSWORD = "Vinutha_1980"

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase()
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false
  return email.trim().toLowerCase() === getAdminEmail()
}

export async function requireAdminSession() {
  const authUser = await getAuthUser()
  if (!authUser || !isAdminEmail(authUser.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
