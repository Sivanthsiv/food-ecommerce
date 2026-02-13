"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        // Prefer `error` returned by the API. Only include a shortened/sanitized
        // `details` string when `error` is present to avoid exposing raw internals.
        let message = "Login failed"
        if (data?.error) {
          const rawDetails = typeof data.details === "string" ? data.details.replace(/\s+/g, " ") : ""
          const safeDetails = rawDetails ? `: ${rawDetails.slice(0, 200)}` : ""
          message = `${data.error}${safeDetails}`
        }
        throw new Error(message)
      }
      const data = await res.json().catch(() => null)
      const nextPath = data?.user?.isAdmin ? "/admin" : "/account"
      router.push(nextPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 px-4 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Log in</h1>
        <p className="text-base text-muted-foreground">
          Welcome back. Enter your details to continue.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
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
          <label className="text-sm font-medium text-foreground" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link className="font-medium text-primary hover:underline" href="/signup">
          Create an account
        </Link>
      </p>
    </div>
  )
}
