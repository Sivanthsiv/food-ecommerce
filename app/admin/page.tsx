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
}

type Order = {
  id: string
  status: string
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

export default function AdminPage() {
  const router = useRouter()
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [orderStatusDraft, setOrderStatusDraft] = useState<Record<string, string>>({})

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

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [products]
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

  async function updateOrderStatus(orderId: string) {
    const status = orderStatusDraft[orderId]
    if (!status) return

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

  if (checkingAccess) {
    return <div className="p-10 text-center text-muted-foreground">Checking admin access...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 lg:px-8">
        <section className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage products, update catalog details, and track all customer orders.
          </p>
        </section>

        {error && (
          <section className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
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

          <div className="rounded-lg border border-border bg-card p-6">
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

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">Customer Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View who ordered each item and update order status.
          </p>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders found.</p>
            ) : (
              orders.map((order) => (
                <article className="rounded-lg border border-border p-4" key={order.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        Order #{order.id} | {formatPaise(order.totalPaise)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className="w-40"
                        onChange={(event) =>
                          setOrderStatusDraft((prev) => ({
                            ...prev,
                            [order.id]: event.target.value,
                          }))
                        }
                        placeholder={order.status}
                        value={orderStatusDraft[order.id] ?? order.status}
                      />
                      <Button
                        onClick={() => void updateOrderStatus(order.id)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-border p-3 text-sm">
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
                    <div className="rounded-md border border-border p-3 text-sm">
                      <p className="font-medium text-foreground">Delivery Address</p>
                      <p>{order.addressLine1}</p>
                      {order.addressLine2 && <p>{order.addressLine2}</p>}
                      <p>
                        {order.city}, {order.state} {order.postalCode}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-md border border-border p-3">
                    <p className="font-medium text-foreground">Items Ordered</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.name} | Qty {item.quantity} | {formatPaise(item.pricePaise)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
