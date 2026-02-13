"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Leaf, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/cart-context"
import { useCart } from "@/lib/cart-context"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            {discount}% OFF
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {product.isVeg ? (
            <span className="h-6 w-6 rounded-sm border-2 border-primary bg-card flex items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
          ) : (
            <span className="h-6 w-6 rounded-sm border-2 border-destructive bg-card flex items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs font-normal capitalize">
            {product.category}
          </Badge>
          <div className="flex items-center gap-0.5 text-muted-foreground">
            {product.spiceLevel === "hot" && (
              <>
                <Flame className="h-3 w-3 text-destructive" />
                <Flame className="h-3 w-3 text-destructive" />
                <Flame className="h-3 w-3 text-destructive" />
              </>
            )}
            {product.spiceLevel === "medium" && (
              <>
                <Flame className="h-3 w-3 text-accent" />
                <Flame className="h-3 w-3 text-accent" />
              </>
            )}
            {product.spiceLevel === "mild" && (
              <Flame className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </div>

        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-foreground">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => addToCart(product)}
            className="h-9 px-3"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          {product.weight} • Shelf life: {product.shelfLife}
        </p>
      </div>
    </div>
  )
}
