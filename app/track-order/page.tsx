"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TrackedOrder = {
  id: string
  orderNumber?: string | null
  status: string
  paymentStatus: "pending_review" | "approved" | "rejected"
  paymentMethod: string
  paymentRemark: string | null
  paymentSubmittedAt: string
  paymentVerifiedAt: string | null
  customerName: string
  customerEmail: string
  createdAt: string
  totalPaise: number
  items: Array<{
    id: string
    name: string
    quantity: number
    pricePaise: number
  }>
}

function formatPaise(paise: number) {
  return `Rs ${(paise / 100).toFixed(2)}`
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get("orderId") ?? ""
  const [orderId, setOrderId] = useState(initialOrderId)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<TrackedOrder | null>(null)

  const paymentStatusLabel = useMemo(() => {
    if (!order) return ""
    if (order.paymentStatus === "approved") return "Payment Approved"
    if (order.paymentStatus === "rejected") return "Payment Rejected"
    return "Payment Pending Review"
  }, [order])

  const handleTrack = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setOrder(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/track`, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error || "Unable to track this order")
      }
      if (!data || !data.order) {
        throw new Error("Invalid response from server")
      }
      setOrder(data.order)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to track this order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 lg:px-8">
        <section className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-semibold text-foreground">Track Order</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Check your order and payment verification status.
          </p>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleTrack}>
            <div className="space-y-2">
              <Label htmlFor="orderId">Order Number / Order ID</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder="Enter order number (e.g. EK-250213-123456)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Order Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter email used in checkout"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Checking..." : "Track Order"}
              </Button>
            </div>
          </form>
          {error && (
            <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </section>

        {order && (
          <section className="space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Order #{order.orderNumber || order.id}
                </h2>
                {order.orderNumber && (
                  <p className="text-xs text-muted-foreground">Internal ID: {order.id}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="text-base font-semibold text-foreground">{formatPaise(order.totalPaise)}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border p-3 text-sm">
                <p className="font-medium text-foreground">Order Status</p>
                <p className="capitalize text-muted-foreground">{order.status.replaceAll("_", " ")}</p>
              </div>
              <div className="rounded-md border border-border p-3 text-sm">
                <p className="font-medium text-foreground">Payment Status</p>
                <p className="text-muted-foreground">{paymentStatusLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted: {new Date(order.paymentSubmittedAt).toLocaleString()}
                </p>
                {order.paymentVerifiedAt && (
                  <p className="text-xs text-muted-foreground">
                    Verified: {new Date(order.paymentVerifiedAt).toLocaleString()}
                  </p>
                )}
                {order.paymentRemark && (
                  <p className="text-xs text-muted-foreground">Remark: {order.paymentRemark}</p>
                )}
              </div>
            </div>

            <div className="rounded-md border border-border p-3">
              <p className="font-medium text-foreground">Items</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} | Qty {item.quantity} | {formatPaise(item.pricePaise)}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <div>
          <Button variant="outline" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
