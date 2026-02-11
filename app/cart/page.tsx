"use client"

import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, X, ShoppingBag, ArrowRight, Tag } from "lucide-react"
import { useState } from "react"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  const shippingCost = totalPrice >= 500 ? 0 : 49
  const discount = appliedCoupon === "FRESH10" ? totalPrice * 0.1 : 0
  const finalTotal = totalPrice + shippingCost - discount

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "FRESH10") {
      setAppliedCoupon("FRESH10")
    }
    setCouponCode("")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16 px-4">
            <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-3">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added anything to your cart yet. 
              Explore our homemade vegetarian products and start shopping!
            </p>
            <Button asChild size="lg">
              <Link href="/shop">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">
            Shopping Cart
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6">
                      <div className="flex gap-4">
                        <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-4">
                            <div>
                              <Link
                                href={`/product/${item.id}`}
                                className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                              >
                                {item.name}
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.weight} | Vegetarian
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                            >
                              <X className="h-5 w-5" />
                              <span className="sr-only">Remove</span>
                            </button>
                          </div>

                          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-semibold text-foreground">
                                â‚¹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                              {item.quantity > 1 && (
                                <span className="text-sm text-muted-foreground">
                                  (â‚¹{item.price} each)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <Button variant="outline" asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
                <Button variant="ghost" onClick={clearCart} className="text-muted-foreground">
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Have a coupon code?
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={applyCoupon}>
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                      <Tag className="h-4 w-4" />
                      <span>{appliedCoupon} applied!</span>
                      <button
                        onClick={() => setAppliedCoupon(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Try: FRESH10 for 10% off
                  </p>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">â‚¹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary">Discount</span>
                      <span className="text-primary">-â‚¹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">
                      {shippingCost === 0 ? (
                        <span className="text-primary">Free</span>
                      ) : (
                        `â‚¹${shippingCost}`
                      )}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Free shipping on orders above â‚¹500
                    </p>
                  )}
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">
                      â‚¹{finalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full mt-6">
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Secure checkout powered by Razorpay
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


