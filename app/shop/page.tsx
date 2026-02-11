"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/product/product-card"
import { products, categories } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal, X, Flame } from "lucide-react"

type SortOption = "popular" | "price-low" | "price-high" | "newest"
type SpiceLevel = "mild" | "medium" | "hot"

export default function ShopPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "all"
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState<SortOption>("popular")
  const [isVegOnly, setIsVegOnly] = useState(false)
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<SpiceLevel[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (isVegOnly) {
      filtered = filtered.filter((p) => p.isVeg)
    }

    if (selectedSpiceLevels.length > 0) {
      filtered = filtered.filter((p) => selectedSpiceLevels.includes(p.spiceLevel))
    }

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id))
        break
      default:
        break
    }

    return filtered
  }, [selectedCategory, sortBy, isVegOnly, selectedSpiceLevels, priceRange])

  const toggleSpiceLevel = (level: SpiceLevel) => {
    setSelectedSpiceLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  const clearFilters = () => {
    setSelectedCategory("all")
    setSortBy("popular")
    setIsVegOnly(false)
    setSelectedSpiceLevels([])
    setPriceRange([0, 1500])
  }

  const hasActiveFilters =
    selectedCategory !== "all" ||
    isVegOnly ||
    selectedSpiceLevels.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 1500

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-foreground mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              {category.name}
              <span className="float-right text-xs opacity-70">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-foreground mb-3">Dietary</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="veg-only"
            checked={isVegOnly}
            onCheckedChange={(checked) => setIsVegOnly(checked === true)}
          />
          <Label htmlFor="veg-only" className="text-sm cursor-pointer">
            Vegetarian Only
          </Label>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-foreground mb-3">Spice Level</h3>
        <div className="space-y-2">
          {(["mild", "medium", "hot"] as SpiceLevel[]).map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`spice-${level}`}
                checked={selectedSpiceLevels.includes(level)}
                onCheckedChange={() => toggleSpiceLevel(level)}
              />
              <Label htmlFor={`spice-${level}`} className="text-sm cursor-pointer flex items-center gap-2 capitalize">
                {level}
                <span className="flex">
                  {level === "mild" && <Flame className="h-3 w-3 text-muted-foreground" />}
                  {level === "medium" && (
                    <>
                      <Flame className="h-3 w-3 text-accent" />
                      <Flame className="h-3 w-3 text-accent" />
                    </>
                  )}
                  {level === "hot" && (
                    <>
                      <Flame className="h-3 w-3 text-destructive" />
                      <Flame className="h-3 w-3 text-destructive" />
                      <Flame className="h-3 w-3 text-destructive" />
                    </>
                  )}
                </span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full bg-transparent">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              Shop All Products
            </h1>
            <p className="mt-2 text-muted-foreground">
              Explore our complete range of ready-to-eat and instant vegetarian products, chutney powders, and masala powders
            </p>
          </div>

          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-lg border border-border p-6">
                <h2 className="font-medium text-foreground mb-4">Filters</h2>
                <FilterContent />
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                          <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            !
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full max-w-xs bg-background">
                      <SheetHeader className="mb-6">
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <FilterContent />
                    </SheetContent>
                  </Sheet>

                  <p className="text-sm text-muted-foreground">
                    {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Popularity</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">New Arrivals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">
                    No products match your filters
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
