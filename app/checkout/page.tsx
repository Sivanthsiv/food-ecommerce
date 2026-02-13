"use client"

import React from "react"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Smartphone, Shield, Truck, Check } from "lucide-react"

type ProfileUser = {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
}

const emptyCheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
}
const AUTH_CACHE_KEY = "ek_auth_user_v1"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("")
  const [paymentProofUrl, setPaymentProofUrl] = useState("")
  const [utrNumber, setUtrNumber] = useState("")
  const [payerUpiId, setPayerUpiId] = useState("")
  const [bookingFor, setBookingFor] = useState<"self" | "other">("self")
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [formData, setFormData] = useState(emptyCheckoutForm)
  const [otherRecipientDraft, setOtherRecipientDraft] = useState(emptyCheckoutForm)

  const applyProfileDefaults = (user: ProfileUser) => {
    const nameParts = (user.name ?? "").trim().split(/\s+/).filter(Boolean)
    const firstName = nameParts[0] ?? ""
    const lastName = nameParts.slice(1).join(" ")
    setFormData((prev) => ({
      ...prev,
      firstName,
      lastName,
      email: user.email ?? "",
      phone: user.phone ?? "",
      address: user.addressLine1 ?? user.addressLine2 ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      pincode: user.postalCode ?? "",
    }))
  }

  const loadProfileDefaults = useCallback(async () => {
    setProfileLoading(true)
    try {
      const res = await fetch("/api/auth/profile", { credentials: "include", cache: "no-store" })
      const data = await res.json().catch(() => null)
      const user = data?.user as ProfileUser | null | undefined

      if (user) {
        setProfileUser(user)
        applyProfileDefaults(user)
        return
      }

      setProfileUser(null)
      try {
        const raw = sessionStorage.getItem(AUTH_CACHE_KEY)
        if (!raw) return
        const cached = JSON.parse(raw) as { user?: ProfileUser | null }
        if (cached?.user) {
          setFormData((prev) => ({
            ...prev,
            firstName: (cached.user?.name ?? "").split(/\s+/)[0] ?? prev.firstName,
            email: cached.user?.email ?? prev.email,
          }))
        }
      } catch {
        // Ignore session storage issues.
      }
    } catch {
      setProfileUser(null)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const handleBookingForChange = (value: "self" | "other") => {
    setBookingFor(value)
    setError(null)

    if (value === "self") {
      void loadProfileDefaults()
      return
    }

    setFormData(otherRecipientDraft)
  }

  const shippingCost = totalPrice >= 500 ? 0 : 49
  const finalTotal = totalPrice + shippingCost
  const upiId = "8722641378@ibl"
  const upiPayeeName = "EasyKitchen"
  const upiNote = "EasyKitchen Checkout Payment"
  const upiPaymentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    upiPayeeName,
  )}&am=${finalTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(upiNote)}`

  useEffect(() => {
    let active = true
    const generateQr = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(upiPaymentUrl, {
          width: 280,
          margin: 1,
        })
        if (!active) return
        setQrCodeDataUrl(dataUrl)
      } catch {
        if (!active) return
        setQrCodeDataUrl("")
      }
    }

    void generateQr()
    return () => {
      active = false
    }
  }, [upiPaymentUrl])

  useEffect(() => {
    void loadProfileDefaults()
  }, [loadProfileDefaults])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (bookingFor === "other") {
      setOtherRecipientDraft((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (bookingFor === "self" && !profileUser) {
      setError("Please log in and complete your profile to book for yourself.")
      return
    }

    if (!utrNumber.trim()) {
      setError("Please enter UTR number.")
      return
    }

    if (!payerUpiId.trim()) {
      setError("Please enter your UPI ID.")
      return
    }

    if (!paymentProofUrl) {
      setError("Please upload payment screenshot.")
      return
    }

    setIsProcessing(true)
    try {
      const payload = {
        bookingFor,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        customer: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
        },
        address: {
          line1: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
        },
        payment: {
          utrNumber: utrNumber.trim(),
          upiId: payerUpiId.trim(),
          screenshotUrl: paymentProofUrl,
        },
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error || "Unable to place order")
      }

      clearCart()
      const orderRef =
        data && typeof data.orderNumber === "string"
          ? String(data.orderNumber).trim()
          : data && typeof data.orderId === "string"
          ? String(data.orderId).trim()
          : ""
      if (orderRef) {
        router.push(`/order-success?orderId=${encodeURIComponent(orderRef)}`)
      } else {
        console.error("Missing orderId in /api/orders response", data)
        setError("Order created but no order id was returned. Please contact support.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place order")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProofUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingProof(true)
    setError(null)
    try {
      const formDataPayload = new FormData()
      formDataPayload.append("file", file)

      const res = await fetch("/api/orders/upload-proof", {
        method: "POST",
        body: formDataPayload,
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error || "Unable to upload screenshot")
      }
      setPaymentProofUrl(data.screenshotUrl ?? "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload screenshot")
      setPaymentProofUrl("")
    } finally {
      setUploadingProof(false)
      event.target.value = ""
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16 px-4">
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-4">
              No items to checkout
            </h1>
            <p className="text-muted-foreground mb-6">Add some items to your cart first.</p>
            <Button asChild>
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          {/* Back Link */}
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>

          <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Who are you booking for?</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleBookingForChange("self")}
                      className={`rounded-md border p-4 text-left transition-colors ${
                        bookingFor === "self"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className="font-medium text-foreground">Myself</p>
                      <p className="text-sm text-muted-foreground">
                        Use my saved profile contact and address as default.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBookingForChange("other")}
                      className={`rounded-md border p-4 text-left transition-colors ${
                        bookingFor === "other"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className="font-medium text-foreground">Someone Else</p>
                      <p className="text-sm text-muted-foreground">
                        Enter recipient details and delivery address manually.
                      </p>
                    </button>
                  </div>
                  {bookingFor === "self" && (
                    <div className="mt-3 rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                      {profileLoading
                        ? "Loading your saved profile..."
                        : profileUser
                        ? "Saved profile details have been filled. You can adjust before placing order."
                        : "You are not logged in. Please log in to use saved profile defaults."}
                      {profileUser && (
                        <div className="mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void loadProfileDefaults()}
                          >
                            Reload saved profile details
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  {bookingFor === "self" &&
                    !profileLoading &&
                    profileUser &&
                    (!profileUser.phone ||
                      !profileUser.addressLine1 ||
                      !profileUser.city ||
                      !profileUser.state ||
                      !profileUser.postalCode) && (
                      <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
                        Your profile is incomplete. Please update phone and full address in{" "}
                        <Link href="/account/profile" className="underline">
                          My Profile
                        </Link>
                        .
                      </div>
                    )}
                </div>

                {/* Contact Information */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    {bookingFor === "self" ? "Your Contact Information" : "Recipient Contact Information"}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="+91"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    {bookingFor === "self" ? "Your Delivery Address" : "Recipient Delivery Address"}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="House no., Building, Street"
                      />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                          pattern="[0-9]{6}"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* UPI Payment */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Payment (UPI QR Only)</h2>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Smartphone className="h-4 w-4" />
                      Pay via any UPI app
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Scan this QR and pay exactly <strong>Rs {finalTotal.toFixed(2)}</strong>.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      UPI ID: <span className="font-medium text-foreground">{upiId}</span>
                    </p>
                    <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                      <div className="relative h-[220px] w-[220px] overflow-hidden rounded-md border border-border bg-white p-2">
                        {qrCodeDataUrl ? (
                          <Image
                            src={qrCodeDataUrl}
                            alt="UPI QR Code"
                            fill
                            className="object-contain p-2"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            Generating QR...
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>1. Open GPay/PhonePe/Paytm/BHIM</p>
                        <p>2. Scan this QR code</p>
                        <p>3. Confirm amount and complete payment</p>
                        <a
                          href={upiPaymentUrl}
                          className="inline-block text-primary underline"
                        >
                          Open UPI app on this device
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div>
                      <Label htmlFor="payerUpiId">Your UPI ID</Label>
                      <Input
                        id="payerUpiId"
                        value={payerUpiId}
                        onChange={(event) => setPayerUpiId(event.target.value)}
                        placeholder="example@upi"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="utrNumber">UTR / Transaction Number</Label>
                      <Input
                        id="utrNumber"
                        value={utrNumber}
                        onChange={(event) => setUtrNumber(event.target.value)}
                        placeholder="Enter UTR number"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentScreenshot">Payment Screenshot</Label>
                      <Input
                        id="paymentScreenshot"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => void handleProofUpload(event)}
                        className="mt-1"
                        required={!paymentProofUrl}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {uploadingProof
                          ? "Uploading screenshot..."
                          : "Upload screenshot after completing UPI payment"}
                      </p>
                      {paymentProofUrl && (
                        <div className="relative mt-3 h-28 w-28 overflow-hidden rounded-md border border-border">
                          <Image
                            src={paymentProofUrl}
                            alt="Payment proof uploaded"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-start gap-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-border mt-4 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{totalPrice.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">
                        {shippingCost === 0 ? (
                          <span className="text-primary">Free</span>
                        ) : (
                          `₹${shippingCost}`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border mt-4 pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-xl font-bold text-foreground">
                        ₹{finalTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-6"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      "Finalizing..."
                    ) : (
                      <>
                        I Have Completed UPI Payment
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        <span>Secure Payment</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        <span>Fast Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
