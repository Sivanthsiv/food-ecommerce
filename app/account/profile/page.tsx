"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AuthUser = {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  isAdmin?: boolean
}

const AUTH_CACHE_KEY = "ek_auth_user_v1"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [originalProfile, setOriginalProfile] = useState<null | {
    name: string
    email: string
    phone: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    postalCode: string
  }>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
        const data = await res.json().catch(() => null)
        if (!res.ok || !data?.user) {
          router.replace("/login")
          return
        }
        setName(data.user.name ?? "")
        setEmail(data.user.email ?? "")
        setPhone(data.user.phone ?? "")
        setAddressLine1(data.user.addressLine1 ?? "")
        setAddressLine2(data.user.addressLine2 ?? "")
        setCity(data.user.city ?? "")
        setState(data.user.state ?? "")
        setPostalCode(data.user.postalCode ?? "")
      } catch {
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }
    void loadUser()
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim(),
          phone: phone.trim() || null,
          addressLine1: addressLine1.trim() || null,
          addressLine2: addressLine2.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          postalCode: postalCode.trim() || null,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error || "Unable to update profile")
      }

      const user = data?.user as AuthUser | undefined
      if (user) {
        try {
          sessionStorage.setItem(
            AUTH_CACHE_KEY,
            JSON.stringify({ user, timestamp: Date.now() }),
          )
        } catch {
          // Ignore client storage failures.
        }
      }

      setSuccess("Profile updated successfully.")
      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">Loading profile...</div>
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">My Profile</h1>
        <p className="text-base text-muted-foreground">
          Update your personal details and preferences.
        </p>
      </div>

      {!isEditing ? (
        <div className="mt-8 space-y-4 rounded-lg border border-border bg-card p-6">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-base text-foreground">{name || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-base text-foreground">{email || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="text-base text-foreground">{phone || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="text-base text-foreground">
              {[addressLine1, addressLine2, city, state, postalCode].filter(Boolean).join(", ") ||
                "Not set"}
            </p>
          </div>

          {success && <p className="text-sm text-green-600">{success}</p>}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => {
                    setError(null)
                    setSuccess(null)
                    setOriginalProfile({
                      name,
                      email,
                      phone,
                      addressLine1,
                      addressLine2,
                      city,
                      state,
                      postalCode,
                    })
                    setIsEditing(true)
              }}
            >
              Edit Profile
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </div>
      ) : (
        <form className="mt-8 space-y-4 rounded-lg border border-border bg-card p-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="phone">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="e.g. +91 9876543210"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="addressLine1">
              Address Line 1 (optional)
            </label>
            <Input
              id="addressLine1"
              value={addressLine1}
              onChange={(event) => setAddressLine1(event.target.value)}
              placeholder="Flat, street, area"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="addressLine2">
              Address Line 2 (optional)
            </label>
            <Input
              id="addressLine2"
              value={addressLine2}
              onChange={(event) => setAddressLine2(event.target.value)}
              placeholder="Landmark"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="city">
                City (optional)
              </label>
              <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="state">
                State (optional)
              </label>
              <Input id="state" value={state} onChange={(event) => setState(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="postalCode">
                Postal Code (optional)
              </label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // restore original values when canceling edit
                if (originalProfile) {
                  setName(originalProfile.name)
                  setEmail(originalProfile.email)
                  setPhone(originalProfile.phone)
                  setAddressLine1(originalProfile.addressLine1)
                  setAddressLine2(originalProfile.addressLine2)
                  setCity(originalProfile.city)
                  setState(originalProfile.state)
                  setPostalCode(originalProfile.postalCode)
                }
                setIsEditing(false)
                setError(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
