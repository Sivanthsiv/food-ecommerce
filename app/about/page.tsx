import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import {
  Target,
  Eye,
  Heart,
  Shield,
  Users,
  Leaf,
  Award,
  ArrowRight,
} from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Quality First",
    description: "We never compromise on the quality of our ingredients. Every product is made with fresh, premium-grade materials.",
  },
  {
    icon: Shield,
    title: "Safety & Hygiene",
    description: "Our state-of-the-art facility follows strict FSSAI guidelines and international food safety standards.",
  },
  {
    icon: Leaf,
    title: "Natural Goodness",
    description: "Zero preservatives, no artificial colors or flavors. Just pure, natural ingredients in every bite.",
  },
  {
    icon: Users,
    title: "Customer Delight",
    description: "Your satisfaction is our priority. We are committed to delivering joy through delicious, convenient vegetarian products.",
  },
]

const milestones = [
  { year: "2019", title: "Founded", description: "Started with a vision to make quality vegetarian foods accessible" },
  { year: "2020", title: "FSSAI Certified", description: "Achieved official food safety certification" },
  { year: "2021", title: "10K+ Customers", description: "Crossed our first major customer milestone" },
  { year: "2022", title: "50+ Products", description: "Expanded our product range significantly" },
  { year: "2023", title: "Pan-India Delivery", description: "Started delivering across all states" },
  { year: "2024", title: "ISO Certified", description: "Achieved international quality standards" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl text-balance">
                Bringing Home-Cooked Comfort to Your Table
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                EasyKitchen was born from a simple idea: everyone deserves access to delicious,`r`n                nutritious, and convenient vegetarian products without compromising on quality or taste. 
                We are on a mission to transform the way India eats.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <Image
                  src="/about-kitchen.jpg"
                  alt="Our kitchen facility"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                  Our Story
                </h2>
                <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Founded in 2019 in Bangalore, EasyKitchen started as a small kitchen with 
                    big dreams. Our founders, passionate food enthusiasts and working professionals 
                    themselves, understood the daily struggle of finding wholesome vegetarian options amidst 
                    busy schedules.
                  </p>
                  <p>
                    What began as a solution for their own needs quickly became a movement. 
                    By combining traditional Indian recipes with modern food preservation 
                    technology, we created products that taste fresh and stay fresh - without any artificial preservatives.
                    any artificial preservatives.
                  </p>
                  <p>
                    Today, we serve thousands of customers across India, from busy students 
                    to working families, all united by their love for good food and 
                    convenience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-secondary/50">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To make healthy, delicious, and convenient vegetarian products accessible to every Indian 
                  household. We believe good food should not be a luxury â€” it is a necessity 
                  that everyone deserves, regardless of how busy life gets.
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To become India&apos;s most trusted ready-to-eat and instant vegetarian brand, known for quality, 
                  innovation, and customer delight. We envision a future where every meal and snack is 
                  a moment of joy, not a source of stress.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                Our Values
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do, from sourcing ingredients to delivering your order.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div key={value.title} className="text-center p-6">
                  <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                Our Journey
              </h2>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.year}
                    className={`relative flex flex-col md:flex-row gap-4 md:gap-8 items-center ${
                      index % 2 === 0 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="flex-1 md:text-right">
                      {index % 2 === 0 ? (
                        <div className="bg-card rounded-lg border border-border p-6">
                          <span className="text-sm font-medium text-primary">{milestone.year}</span>
                          <h3 className="text-lg font-semibold text-foreground mt-1">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2">{milestone.description}</p>
                        </div>
                      ) : (
                        <div className="hidden md:block" />
                      )}
                    </div>
                    <div className="hidden md:flex h-4 w-4 rounded-full bg-primary flex-shrink-0 z-10" />
                    <div className="flex-1">
                      {index % 2 !== 0 ? (
                        <div className="bg-card rounded-lg border border-border p-6">
                          <span className="text-sm font-medium text-primary">{milestone.year}</span>
                          <h3 className="text-lg font-semibold text-foreground mt-1">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2">{milestone.description}</p>
                        </div>
                      ) : (
                        <div className="md:hidden bg-card rounded-lg border border-border p-6">
                          <span className="text-sm font-medium text-primary">{milestone.year}</span>
                          <h3 className="text-lg font-semibold text-foreground mt-1">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2">{milestone.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="bg-primary rounded-2xl p-8 lg:p-12 text-center text-primary-foreground">
              <Award className="h-12 w-12 mx-auto mb-6 opacity-80" />
              <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
                Experience the EasyKitchen Difference
              </h2>
              <p className="mt-4 max-w-2xl mx-auto opacity-80">
                Join thousands of satisfied customers who have discovered the joy of 
                convenient, delicious, and healthy vegetarian products.
              </p>
              <Button asChild size="lg" variant="secondary" className="mt-8">
                <Link href="/shop">
                  Browse Our Menu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}



