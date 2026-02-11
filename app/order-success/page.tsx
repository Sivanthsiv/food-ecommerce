import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, ArrowRight } from "lucide-react"

export default function OrderSuccessPage() {
  const orderNumber = `FB${Date.now().toString().slice(-8)}`

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center py-16 px-4 max-w-lg">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>

          <h1 className="font-serif text-3xl font-semibold text-foreground mb-3">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order. We will send you a confirmation email shortly.
          </p>

          <div className="bg-card rounded-lg border border-border p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Order Number</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{orderNumber}</p>
            <p className="text-sm text-muted-foreground mt-4">
              Estimated delivery: 3-5 business days
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild size="lg" className="w-full">
              <Link href="/shop">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            Questions about your order?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
