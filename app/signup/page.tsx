"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SignupForm = {
  name: string
  email: string
  password: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
}

const initialForm: SignupForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState<SignupForm>(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.")
      return
    }

    setError(null)
    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
          )
          const data = await res.json().catch(() => null)
          const addr = data?.address ?? {}
          const road = addr.road ?? addr.pedestrian ?? addr.suburb ?? ""
          const houseNumber = addr.house_number ?? ""
          const line1 = [houseNumber, road].filter(Boolean).join(" ").trim()
          const city = addr.city ?? addr.town ?? addr.village ?? ""
          const state = addr.state ?? ""
          const postalCode = addr.postcode ?? ""

          setForm((prev) => ({
            ...prev,
            addressLine1: line1 || prev.addressLine1,
            city: city || prev.city,
            state: state || prev.state,
            postalCode: postalCode || prev.postalCode,
            addressLine2: prev.addressLine2 || `Lat ${lat.toFixed(5)}, Lon ${lon.toFixed(5)}`,
          }))
        } catch {
          setForm((prev) => ({
            ...prev,
            addressLine2: prev.addressLine2 || `Lat ${lat.toFixed(5)}, Lon ${lon.toFixed(5)}`,
          }))
          setError("Location captured, but address lookup failed. Please fill address manually.")
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
        setError("Unable to fetch location. Please allow location permission.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim() || undefined,
          email: form.email,
          password: form.password,
          phone: form.phone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2.trim() || null,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        if (data?.error) {
          throw new Error(data?.details ? `${data.error}: ${data.details}` : data.error)
        }
        throw new Error("Unable to create account right now")
      }
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center gap-6 px-4 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Sign up</h1>
        <p className="text-base text-muted-foreground">Create your EasyKitchen account in a few steps.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="name">
              Name (optional)
            </label>
            <Input id="name" name="name" value={form.name} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="phone">
              Phone
            </label>
            <Input id="phone" name="phone" required value={form.phone} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              value={form.password}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Address Details</p>
            <Button type="button" variant="outline" size="sm" onClick={handleUseLocation} disabled={isLocating}>
              <MapPin className="mr-2 h-4 w-4" />
              {isLocating ? "Locating..." : "Use Current Location"}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="addressLine1">
                Address Line 1
              </label>
              <Input
                id="addressLine1"
                name="addressLine1"
                required
                placeholder="House no., Building, Street"
                value={form.addressLine1}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="addressLine2">
                Address Line 2 (optional)
              </label>
              <Input
                id="addressLine2"
                name="addressLine2"
                placeholder="Landmark, area"
                value={form.addressLine2}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="city">
                  City
                </label>
                <Input id="city" name="city" required value={form.city} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="state">
                  State
                </label>
                <Input id="state" name="state" required value={form.state} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="postalCode">
                  PIN Code
                </label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  required
                  value={form.postalCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-medium text-primary hover:underline" href="/login">
          Log in
        </Link>
      </p>
    </div>
  )
}
