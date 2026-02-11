"use client"

import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { getBestSellers } from "@/lib/products"

export function BestSellers() {
  const bestSellers = getBestSellers()

  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 fill-accent text-accent" />
              <span className="text-sm font-medium text-accent">Top Rated</span>
            </div>
            <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              Best Sellers
            </h2>
            <p className="mt-2 text-muted-foreground">
              Our most popular dishes that customers keep coming back for
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/shop">
              Shop All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
