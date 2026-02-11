import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OrdersPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Order History</h1>
        <p className="text-base text-muted-foreground">
          Your recent orders will appear here once you have placed an order while
          logged in.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/account">Back to Account</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>
    </div>
  )
}
