import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { BenefitsSection } from "@/components/home/benefits-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { BestSellers } from "@/components/home/best-sellers"
import { TestimonialsSection } from "@/components/home/testimonials-section"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <BenefitsSection />
        <FeaturedProducts />
        <BestSellers />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}
