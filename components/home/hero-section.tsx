import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Shield, Leaf } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="relative z-10 lg:w-full lg:max-w-2xl">
          <div className="relative px-4 py-20 sm:py-32 lg:px-8 lg:py-40 lg:pr-0">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Shield className="h-3.5 w-3.5" />
                  FSSAI Certified
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                  <Leaf className="h-3.5 w-3.5" />
                  No Preservatives
                </span>
              </div>
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
                Fresh. Hygienic.
                <span className="block text-primary">Ready in Minutes.</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                100% vegetarian, homemade ready-to-eat and instant products, chutney powders, and masala powders
                crafted with fresh ingredients and authentic recipes.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="h-12 px-6">
                  <Link href="/shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Ready in 5 mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-sm border-2 border-primary flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span>100% Vegetarian</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <Image
          src="/hero-food.jpg"
          alt="Homemade vegetarian ready-to-eat and instant products"
          fill
          sizes="50vw"
          className="aspect-[3/2] object-cover lg:aspect-auto lg:h-full lg:w-full"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
      </div>
    </section>
  )
}


