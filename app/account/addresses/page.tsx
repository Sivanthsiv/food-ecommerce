import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AddressesPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Saved Addresses</h1>
        <p className="text-base text-muted-foreground">
          You can save multiple delivery addresses for faster checkout. Address
          management will be available soon.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/account">Back to Account</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  )
}
