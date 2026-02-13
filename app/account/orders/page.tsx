"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type OrderItem = {
  id: string
  name: string
  quantity: number
  pricePaise: number
  reviewRating?: number | null
  reviewComment?: string | null
}

type Order = {
  id: string
  orderNumber?: string | null
  status: string
  paymentStatus: string
  totalPaise: number
  createdAt: string
  items: OrderItem[]
}

type DraftReview = {
  rating: string
  comment: string
}

function formatPaise(paise: number) {
  return `Rs ${(paise / 100).toFixed(2)}`
}

export default function OrdersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submittingKey, setSubmittingKey] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, DraftReview>>({})

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/orders/my", { credentials: "include", cache: "no-store" })
        const data = await res.json().catch(() => null)
        if (res.status === 401) {
          router.replace("/login")
          return
        }
        if (!res.ok) {
          throw new Error(data?.error || "Unable to load orders")
        }
        setOrders(data?.orders ?? [])
      } catch (err) {
        // Only show a limited set of client-friendly errors; otherwise show a generic message
        const allowed = [
          "Unable to load orders",
        ]
        const msg = err instanceof Error && allowed.includes(err.message) ? err.message : "Unable to load orders"
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    void loadOrders()
  }, [router])

  const deliveredOrders = useMemo(
    () => orders.filter((order) => String(order.status).toLowerCase() === "delivered"),
    [orders],
  )

  const handleDraftChange = (key: string, patch: Partial<DraftReview>) => {
    setDrafts((prev) => ({
      ...prev,
      [key]: {
        rating: prev[key]?.rating ?? "",
        comment: prev[key]?.comment ?? "",
        ...patch,
      },
    }))
  }

  const submitReview = async (orderId: string, itemId: string) => {
    const key = `${orderId}:${itemId}`
    const draft = drafts[key] ?? { rating: "", comment: "" }
    const rating = Number(draft.rating)
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5.")
      return
    }
    if (draft.comment.trim().length < 2) {
      setError("Please add a short review comment.")
      return
    }

    setSubmittingKey(key)
    setError(null)
    try {
      const res = await fetch("/api/orders/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId,
          itemId,
          rating,
          comment: draft.comment.trim(),
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error || "Unable to submit review")
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id !== orderId
            ? order
            : {
                ...order,
                items: order.items.map((item) =>
                  item.id !== itemId
                    ? item
                    : { ...item, reviewRating: rating, reviewComment: draft.comment.trim() },
                ),
              },
        ),
      )
      // clear draft after successful submit
      setDrafts((prev) => {
        const copy = { ...prev }
        delete copy[key]
        return copy
      })
    } catch (err) {
      const allowedClient = [
        "Please select a rating between 1 and 5.",
        "Please add a short review comment.",
      ]
      const msg = err instanceof Error && allowedClient.includes(err.message) ? err.message : "Unable to submit review"
      setError(msg)
    } finally {
      setSubmittingKey(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-foreground">Order History</h1>
      <p className="mt-2 text-muted-foreground">Delivered orders can be reviewed below.</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/shop">Browse Products</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/track-order">Track an Order</Link>
        </Button>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        ) : deliveredOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No delivered orders yet.</p>
        ) : (
          deliveredOrders.map((order) => (
            <article key={order.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">
                  Order #{order.orderNumber || order.id} | {formatPaise(order.totalPaise)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Delivered on {
                    // guard against invalid dates
                    (() => {
                      const d = new Date(order.createdAt)
                      return isNaN(d.getTime()) ? "Unknown date" : d.toLocaleDateString()
                    })()
                  }
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {order.items.map((item) => {
                  const key = `${order.id}:${item.id}`
                  const draft = drafts[key] ?? { rating: "", comment: "" }
                  // consider an item reviewed when a numeric rating exists (comment may be optional)
                  const reviewed = typeof item.reviewRating === "number" && Number.isFinite(item.reviewRating)

                  return (
                    <div key={item.id} className="rounded-md border border-border p-3">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty {item.quantity} | {formatPaise(item.pricePaise)}
                      </p>

                      {reviewed ? (
                        <div className="mt-2 text-sm">
                          <p className="text-foreground">Rating: {item.reviewRating}/5</p>
                          <p className="text-muted-foreground">Review: {item.reviewComment}</p>
                        </div>
                      ) : (
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            placeholder="Rating (1-5)"
                            value={draft.rating}
                            onChange={(event) => handleDraftChange(key, { rating: event.target.value })}
                          />
                          <div className="sm:col-span-2 flex gap-2">
                            <Input
                              placeholder="Write your review"
                              value={draft.comment}
                              onChange={(event) => handleDraftChange(key, { comment: event.target.value })}
                            />
                            <Button
                              type="button"
                              onClick={() => void submitReview(order.id, item.id)}
                              disabled={submittingKey === key}
                            >
                              {submittingKey === key ? "Submitting..." : "Submit"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
