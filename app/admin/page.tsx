"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  BadgeCheck,
  Clock3,
  IndianRupee,
  PackageCheck,
  Search,
  Truck,
  XCircle,
} from "lucide-react"

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  pricePaise: number
  imageUrl: string | null
  isVeg: boolean
  spiceLevel: string | null
  weight: string | null
  shelfLife: string | null
  createdAt: string
}

type OrderItem = {
  id: string
  name: string
  quantity: number
  pricePaise: number
  reviewRating?: number | null
  reviewComment?: string | null
  reviewCreatedAt?: string | null
}

type Order = {
  id: string
  orderNumber?: string | null
  status: string
  paymentStatus: "pending_review" | "approved" | "rejected"
  paymentMethod: string | null
  paymentUtr: string | null
  paymentUpiId: string | null
  paymentScreenshotUrl: string | null
  paymentSubmittedAt: string | null
  paymentVerifiedAt: string | null
  paymentRemark: string | null
  totalPaise: number
  customerName: string
  customerEmail: string
  customerPhone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
  } | null
  items: OrderItem[]
}

type ProductForm = {
  name: string
  slug: string
  description: string
  category: string
  priceRupees: string
  imageUrl: string
  isVeg: boolean
  spiceLevel: string
  weight: string
  shelfLife: string
}

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  category: "",
  priceRupees: "",
  imageUrl: "",
  isVeg: true,
  spiceLevel: "",
  weight: "",
  shelfLife: "",
}

const fulfillmentStages = [
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const
const acceptedStatusSet = new Set<string>(["approved", "paid", ...fulfillmentStages])
const cancelledStatusSet = new Set<string>(["rejected", "payment_rejected", "cancelled"])

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

function formatPaise(paise: number) {
  return `Rs ${(paise / 100).toFixed(2)}`
}

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "").toString().trim().toLowerCase()
}

function isSameLocalDay(input: string) {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return false
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function statusChipClass(status: string) {
  const normalized = normalizeStatus(status)
  if (normalized === "delivered") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200"
  }
  if (normalized === "payment_rejected" || normalized === "rejected" || normalized === "cancelled") {
    return "bg-rose-100 text-rose-800 border-rose-200"
  }
  if (normalized === "pending_review" || normalized === "awaiting_payment_approval") {
    return "bg-amber-100 text-amber-800 border-amber-200"
  }
  return "bg-sky-100 text-sky-800 border-sky-200"
}

export default function AdminPage() {
  const router = useRouter()
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [orderSearch, setOrderSearch] = useState("")
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const meRes = await fetch("/api/auth/me", { credentials: "include" })
        const meData = await meRes.json()
        if (!meData?.user?.isAdmin) {
          router.replace("/login")
          return
        }
        await loadData()
      } catch {
        router.replace("/login")
      } finally {
        setCheckingAccess(false)
      }
    }
    void checkAccess()
  }, [router])

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 280)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [products]
  )
  const pendingOrders = useMemo(
    () =>
      orders.filter((order) => {
        const paymentStatus = normalizeStatus(order.paymentStatus)
        const orderStatus = normalizeStatus(order.status)
        return !acceptedStatusSet.has(paymentStatus) && !acceptedStatusSet.has(orderStatus) && !cancelledStatusSet.has(paymentStatus) && !cancelledStatusSet.has(orderStatus)
      }),
    [orders],
  )
  const acceptedOrders = useMemo(
    () =>
      orders.filter((order) => {
        const paymentStatus = normalizeStatus(order.paymentStatus)
        const orderStatus = normalizeStatus(order.status)
        return acceptedStatusSet.has(paymentStatus) || acceptedStatusSet.has(orderStatus)
      }),
    [orders],
  )
  const cancelledOrders = useMemo(
    () =>
      orders.filter((order) => {
        const paymentStatus = normalizeStatus(order.paymentStatus)
        const orderStatus = normalizeStatus(order.status)
        return cancelledStatusSet.has(paymentStatus) || cancelledStatusSet.has(orderStatus)
      }),
    [orders],
  )
  const ongoingOrders = useMemo(
    () => acceptedOrders.filter((order) => normalizeStatus(order.status) !== "delivered"),
    [acceptedOrders],
  )
  const deliveredOrders = useMemo(
    () => acceptedOrders.filter((order) => normalizeStatus(order.status) === "delivered"),
    [acceptedOrders],
  )
  const filteredPendingOrders = useMemo(
    () =>
      pendingOrders.filter((order) => {
        const q = orderSearch.trim().toLowerCase()
        if (!q) return true
        return (
          order.id.toLowerCase().includes(q) ||
          (order.orderNumber ?? "").toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.customerEmail.toLowerCase().includes(q)
        )
      }),
    [pendingOrders, orderSearch],
  )
  const filteredAcceptedOrders = useMemo(
    () =>
      acceptedOrders.filter((order) => {
        const q = orderSearch.trim().toLowerCase()
        if (!q) return true
        return (
          order.id.toLowerCase().includes(q) ||
          (order.orderNumber ?? "").toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.customerEmail.toLowerCase().includes(q)
        )
      }),
    [acceptedOrders, orderSearch],
  )
  const filteredOngoingOrders = useMemo(
    () =>
      ongoingOrders.filter((order) => {
        const q = orderSearch.trim().toLowerCase()
        if (!q) return true
        return (
          order.id.toLowerCase().includes(q) ||
          (order.orderNumber ?? "").toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.customerEmail.toLowerCase().includes(q)
        )
      }),
    [ongoingOrders, orderSearch],
  )
  const filteredDeliveredOrders = useMemo(
    () =>
      deliveredOrders.filter((order) => {
        const q = orderSearch.trim().toLowerCase()
        if (!q) return true
        return (
          order.id.toLowerCase().includes(q) ||
          (order.orderNumber ?? "").toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.customerEmail.toLowerCase().includes(q)
        )
      }),
    [deliveredOrders, orderSearch],
  )
  const filteredCancelledOrders = useMemo(
    () =>
      cancelledOrders.filter((order) => {
        const q = orderSearch.trim().toLowerCase()
        if (!q) return true
        return (
          order.id.toLowerCase().includes(q) ||
          (order.orderNumber ?? "").toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.customerEmail.toLowerCase().includes(q)
        )
      }),
    [cancelledOrders, orderSearch],
  )
  const totalEarningsPaise = useMemo(
    () => acceptedOrders.reduce((sum, order) => sum + (order.totalPaise || 0), 0),
    [acceptedOrders],
  )
  const todayEarningsPaise = useMemo(
    () =>
      acceptedOrders
        .filter((order) => isSameLocalDay(order.createdAt))
        .reduce((sum, order) => sum + (order.totalPaise || 0), 0),
    [acceptedOrders],
  )

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/products", { credentials: "include", cache: "no-store" }),
        fetch("/api/admin/orders", { credentials: "include", cache: "no-store" }),
      ])
      const productsData = await productsRes.json().catch(() => ({}))
      const ordersData = await ordersRes.json().catch(() => ({}))

      if (productsRes.ok) {
        setProducts(productsData.products ?? [])
      } else {
        setProducts([])
      }

      if (ordersRes.ok) {
        setOrders(ordersData.orders ?? [])
      } else {
        setOrders([])
      }

      const errors: string[] = []
      if (!productsRes.ok) {
        errors.push(productsData?.error ?? "Failed to load products")
      }
      if (!ordersRes.ok) {
        errors.push(ordersData?.error ?? "Failed to load orders")
      }
      if (errors.length > 0) {
        setError(errors.join(" "))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  function startEdit(product: Product) {
    setEditingProductId(product.id)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      category: product.category,
      priceRupees: (product.pricePaise / 100).toString(),
      imageUrl: product.imageUrl ?? "",
      isVeg: product.isVeg,
      spiceLevel: product.spiceLevel ?? "",
      weight: product.weight ?? "",
      shelfLife: product.shelfLife ?? "",
    })
    setError(null)
  }

  function clearForm() {
    setEditingProductId(null)
    setForm(emptyForm)
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const price = Number(form.priceRupees)
    if (!Number.isFinite(price) || price <= 0) {
      setSaving(false)
      setError("Enter a valid price greater than 0")
      return
    }

    const payload = {
      name: form.name.trim(),
      slug: (form.slug.trim() || toSlug(form.name)).slice(0, 140),
      description: form.description.trim() || undefined,
      category: form.category.trim(),
      pricePaise: Math.round(price * 100),
      imageUrl: form.imageUrl.trim() || undefined,
      isVeg: form.isVeg,
      spiceLevel: form.spiceLevel.trim() || undefined,
      weight: form.weight.trim() || undefined,
      shelfLife: form.shelfLife.trim() || undefined,
    }

    try {
      const endpoint = editingProductId
        ? `/api/admin/products/${editingProductId}`
        : "/api/admin/products"
      const method = editingProductId ? "PUT" : "POST"

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Unable to save product")
      }

      await loadData()
      clearForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product")
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(id: string) {
    const confirmed = window.confirm("Delete this product?")
    if (!confirmed) return

    setError(null)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Unable to delete product")
      }
      await loadData()
      if (editingProductId === id) {
        clearForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete product")
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Unable to update order status")
      }
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update order status")
    }
  }

  async function reviewPayment(orderId: string, paymentStatus: "approved" | "rejected") {
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentStatus }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Unable to review payment")
      }
      const data = await res.json().catch(() => null)
      const updated = data?.order as Order | undefined
      if (updated?.id) {
        setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)))
      }
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to review payment")
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)
    try {
      const payload = new FormData()
      payload.append("file", file)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: payload,
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error || "Unable to upload image")
      }

      setForm((prev) => ({ ...prev, imageUrl: data.imageUrl ?? prev.imageUrl }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload image")
    } finally {
      setUploadingImage(false)
      event.target.value = ""
    }
  }

  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId)
    if (!element) return
    element.scrollIntoView({ behavior: "smooth", block: "start" })
    if (window.location.hash !== `#${sectionId}`) {
      window.history.replaceState(null, "", `#${sectionId}`)
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function renderOrderCard(order: Order, options: { allowReview: boolean; allowTracking: boolean }) {
    return (
      <article className="rounded-lg border border-border p-4" key={order.id}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">
              Order #{order.orderNumber || order.id} | {formatPaise(order.totalPaise)}
            </p>
            {order.orderNumber && <p className="text-xs text-muted-foreground">ID: {order.id}</p>}
            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusChipClass(
              order.status,
            )}`}
          >
            {order.status.replaceAll("_", " ")}
          </span>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 items-stretch">
          <div className="rounded-md border border-border p-3 text-sm h-full">
            <p className="font-medium text-foreground">Customer</p>
            <p>{order.customerName}</p>
            <p>{order.customerEmail}</p>
            <p>{order.customerPhone}</p>
            {order.user && (
              <p className="mt-1 text-xs text-muted-foreground">
                Account: {order.user.name || "User"} ({order.user.email})
              </p>
            )}
          </div>
          <div className="rounded-md border border-border p-3 text-sm h-full">
            <p className="font-medium text-foreground">Delivery Address</p>
            <p>{order.addressLine1}</p>
            {order.addressLine2 && <p>{order.addressLine2}</p>}
            <p>
              {order.city}, {order.state} {order.postalCode}
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-5 items-stretch">
          <div className="rounded-md border border-border p-3 text-sm lg:col-span-2 h-full">
            <p className="font-medium text-foreground">Payment Verification</p>
            <p className="mt-1 text-muted-foreground">
              Method: {(order.paymentMethod ?? "NA").toUpperCase()} | Status:{" "}
              <span className="font-medium text-foreground">{order.paymentStatus}</span>
            </p>
            <p className="text-muted-foreground">Payer UPI: {order.paymentUpiId ?? "Not submitted"}</p>
            <p className="text-muted-foreground">UTR: {order.paymentUtr ?? "Not submitted"}</p>
            <p className="text-muted-foreground">
              Submitted:{" "}
              {order.paymentSubmittedAt
                ? new Date(order.paymentSubmittedAt).toLocaleString()
                : "Not submitted"}
            </p>
            {order.paymentVerifiedAt && (
              <p className="text-muted-foreground">
                Verified: {new Date(order.paymentVerifiedAt).toLocaleString()}
              </p>
            )}
            {order.paymentRemark && <p className="text-muted-foreground">Remark: {order.paymentRemark}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {order.paymentScreenshotUrl ? (
                <a
                  href={order.paymentScreenshotUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-primary underline"
                >
                  View screenshot
                </a>
              ) : (
                <span className="text-muted-foreground">No screenshot</span>
              )}

              {options.allowReview && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void reviewPayment(order.id, "approved")}
                    disabled={order.paymentStatus === "approved"}
                  >
                    Approve Payment
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => void reviewPayment(order.id, "rejected")}
                    disabled={order.paymentStatus === "rejected"}
                  >
                    Reject Payment
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="rounded-md border border-border p-3 lg:col-span-3 h-full">
            <p className="font-medium text-foreground">Items Ordered</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.name} | Qty {item.quantity} | {formatPaise(item.pricePaise)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {options.allowTracking && (
          <div className="mt-3 rounded-md border border-border p-3 text-sm">
            <p className="font-medium text-foreground">Tracking Status</p>
            <p className="mt-1 text-muted-foreground">
              Update delivery journey: confirmed, packed, shipped, out for delivery, delivered
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {fulfillmentStages.map((stage) => (
                <Button
                  key={stage}
                  type="button"
                  size="sm"
                  variant={order.status === stage ? "default" : "outline"}
                  onClick={() => void updateOrderStatus(order.id, stage)}
                >
                  {stage.replaceAll("_", " ")}
                </Button>
              ))}
            </div>
          </div>
        )}

      </article>
    )
  }

  if (checkingAccess) {
    return <div className="p-10 text-center text-muted-foreground">Checking admin access...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-background to-background">
      <Header />
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 lg:px-8">
        <section className="rounded-2xl border border-orange-200/70 bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Manage products, update catalog details, and track all customer orders.
          </p>
        </section>

        <section id="orders-overview" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Orders Overview</h2>
          <div className="mt-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Search by order id, customer name, email"
                className="pl-9"
              />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            <button
              type="button"
              onClick={() => scrollToSection("orders-overview")}
              className="rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Today Earnings</p>
                <IndianRupee className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-1 text-xl font-semibold text-foreground">{formatPaise(todayEarningsPaise)}</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("orders-overview")}
              className="rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Earnings</p>
                <IndianRupee className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-1 text-xl font-semibold text-foreground">{formatPaise(totalEarningsPaise)}</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("ongoing-orders")}
              className="rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Accepted Orders</p>
                <BadgeCheck className="h-4 w-4 text-sky-600" />
              </div>
              <p className="mt-1 text-xl font-semibold text-foreground">{acceptedOrders.length}</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("pending-orders")}
              className="rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending Orders</p>
                <Clock3 className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-1 text-xl font-semibold text-foreground">{pendingOrders.length}</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("delivered-orders")}
              className="rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Delivered Orders</p>
                <PackageCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-1 text-xl font-semibold text-foreground">{deliveredOrders.length}</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("cancelled-orders")}
              className="rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Cancelled Orders</p>
                <XCircle className="h-4 w-4 text-rose-600" />
              </div>
              <p className="mt-1 text-xl font-semibold text-foreground">{cancelledOrders.length}</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("accepted-orders")}
              className="rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Ongoing Orders</p>
                <Truck className="h-4 w-4 text-indigo-600" />
              </div>
              <p className="mt-1 text-xl font-semibold text-foreground">{ongoingOrders.length}</p>
            </button>
          </div>
        </section>

        {error && (
          <section className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">
              {editingProductId ? `Edit Product #${editingProductId}` : "Add Product"}
            </h2>
            <form className="mt-4 space-y-4" onSubmit={saveProduct}>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                  placeholder="auto-generated if empty"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rupees)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.priceRupees}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, priceRupees: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={form.imageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="max-w-sm"
                    id="localImage"
                    onChange={(event) => void handleImageUpload(event)}
                    type="file"
                  />
                  <span className="text-xs text-muted-foreground">
                    {uploadingImage ? "Uploading image..." : "Upload from this device"}
                  </span>
                </div>
                {form.imageUrl && (
                  <div className="relative h-28 w-28 overflow-hidden rounded-md border border-border">
                    <Image
                      alt="Product preview"
                      className="object-cover"
                      fill
                      src={form.imageUrl}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="spiceLevel">Spice</Label>
                  <Input
                    id="spiceLevel"
                    value={form.spiceLevel}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, spiceLevel: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={form.weight}
                    onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shelfLife">Shelf Life</Label>
                  <Input
                    id="shelfLife"
                    value={form.shelfLife}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, shelfLife: event.target.value }))
                    }
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  checked={form.isVeg}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, isVeg: event.target.checked }))
                  }
                  type="checkbox"
                />
                Vegetarian product
              </label>
              <div className="flex gap-3">
                <Button disabled={saving} type="submit">
                  {saving ? "Saving..." : editingProductId ? "Update Product" : "Add Product"}
                </Button>
                {editingProductId && (
                  <Button type="button" variant="outline" onClick={clearForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Products</h2>
              <Button disabled={loading} onClick={() => void loadData()} type="button" variant="outline">
                Refresh
              </Button>
            </div>
            <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading products...</p>
              ) : sortedProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products found.</p>
              ) : (
                sortedProducts.map((product) => (
                  <div
                    className="rounded-lg border border-border p-3"
                    key={product.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          #{product.id} | {product.slug}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {product.category} | {formatPaise(product.pricePaise)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEdit(product)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => void deleteProduct(product.id)}
                          size="sm"
                          type="button"
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section id="accepted-orders" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Accepted Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Payment approved orders with delivery tracking status.
          </p>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : filteredAcceptedOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accepted orders.</p>
            ) : (
              filteredAcceptedOrders.map((order) => renderOrderCard(order, { allowReview: false, allowTracking: true }))
            )}
          </div>
        </section>

        <section id="ongoing-orders" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Ongoing Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Accepted orders that are still in progress (not delivered yet).
          </p>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : filteredOngoingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ongoing orders.</p>
            ) : (
              filteredOngoingOrders.map((order) => renderOrderCard(order, { allowReview: false, allowTracking: true }))
            )}
          </div>
        </section>

        <section id="delivered-orders" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Delivered Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Delivered orders with customer product reviews.
          </p>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : filteredDeliveredOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No delivered orders.</p>
            ) : (
              filteredDeliveredOrders.map((order) => (
                <article className="rounded-lg border border-border p-4" key={order.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        Order #{order.orderNumber || order.id} | {formatPaise(order.totalPaise)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Status: delivered</p>
                  </div>

                  <div className="mt-3 rounded-md border border-border p-3">
                    <p className="font-medium text-foreground">Customer Reviews</p>
                    <ul className="mt-2 space-y-2 text-sm">
                      {order.items.map((item) => (
                        <li key={item.id} className="rounded-md border border-border p-2">
                          <p className="font-medium text-foreground">{item.name}</p>
                          {typeof item.reviewRating === "number" && item.reviewComment ? (
                            <>
                              <p className="text-muted-foreground">Rating: {item.reviewRating}/5</p>
                              <p className="text-muted-foreground">Review: {item.reviewComment}</p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">No review submitted yet.</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section id="cancelled-orders" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Cancelled Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders cancelled due to rejected payment.
          </p>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : filteredCancelledOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cancelled orders.</p>
            ) : (
              filteredCancelledOrders.map((order) => renderOrderCard(order, { allowReview: false, allowTracking: false }))
            )}
          </div>
        </section>

        <section id="pending-orders" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Pending Payment Review</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve or reject payments submitted by customers.
          </p>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : filteredPendingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending orders.</p>
            ) : (
              filteredPendingOrders.map((order) => renderOrderCard(order, { allowReview: true, allowTracking: false }))
            )}
          </div>
        </section>

      </main>
      <Footer />
      {showScrollTop && (
        <Button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 shadow-lg"
        >
          Scroll to top
        </Button>
      )}
    </div>
  )
}
