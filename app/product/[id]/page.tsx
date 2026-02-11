"use client"

import { use, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useCart } from "@/lib/cart-context"
import { getProductById, products } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product/product-card"
import {
  ShoppingCart,
  Minus,
  Plus,
  Flame,
  Clock,
  Package,
  Leaf,
  ArrowLeft,
  Check,
} from "lucide-react"

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const product = getProductById(id)
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    notFound()
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <nav className="mb-6">
            <Link
              href="/shop"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Link>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground text-sm px-3 py-1">
                  {discount}% OFF
                </Badge>
              )}
              <div className="absolute top-4 right-4">
                {product.isVeg ? (
                  <span className="h-8 w-8 rounded-sm border-2 border-primary bg-card flex items-center justify-center">
                    <span className="h-3 w-3 rounded-full bg-primary" />
                  </span>
                ) : (
                  <span className="h-8 w-8 rounded-sm border-2 border-destructive bg-card flex items-center justify-center">
                    <span className="h-3 w-3 rounded-full bg-destructive" />
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="capitalize">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-0.5">
                  {product.spiceLevel === "hot" && (
                    <>
                      <Flame className="h-4 w-4 text-destructive" />
                      <Flame className="h-4 w-4 text-destructive" />
                      <Flame className="h-4 w-4 text-destructive" />
                    </>
                  )}
                  {product.spiceLevel === "medium" && (
                    <>
                      <Flame className="h-4 w-4 text-accent" />
                      <Flame className="h-4 w-4 text-accent" />
                    </>
                  )}
                  {product.spiceLevel === "mild" && (
                    <Flame className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-4 text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{product.weight}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Shelf Life: {product.shelfLife}</span>
                </div>
                {product.isVeg && (
                  <div className="flex items-center gap-2 text-primary">
                    <Leaf className="h-4 w-4" />
                    <span>Vegetarian</span>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Qty:</span>
                  <div className="flex items-center border border-border rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="flex-1 sm:flex-none h-12 px-8"
                  onClick={() => addToCart(product, quantity)}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </div>

              <div className="mt-8 p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-3">Highlights</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    No artificial preservatives or colors
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    Ready to eat or use in minutes
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    FSSAI certified product
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    Free delivery on orders above ₹500
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 lg:mt-16">
            <Tabs defaultValue="ingredients" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
                <TabsTrigger
                  value="ingredients"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  Ingredients
                </TabsTrigger>
                <TabsTrigger
                  value="nutrition"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  Nutritional Info
                </TabsTrigger>
                <TabsTrigger
                  value="cooking"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  How to Prepare
                </TabsTrigger>
                <TabsTrigger
                  value="storage"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  Storage
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ingredients" className="mt-6">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-medium text-foreground mb-4">Ingredients</h3>
                  <p className="text-muted-foreground">
                    {product.ingredients.join(", ")}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">
                    Nutritional Information (per serving)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                      <div key={key} className="bg-secondary/50 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground capitalize">{key}</p>
                        <p className="text-lg font-semibold text-foreground mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cooking" className="mt-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">
                    Cooking Instructions
                  </h3>
                  <ol className="space-y-3">
                    {product.cookingInstructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="storage" className="mt-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">
                    Storage Instructions
                  </h3>
                  <p className="text-muted-foreground">{product.storageInstructions}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-16 lg:mt-24">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
