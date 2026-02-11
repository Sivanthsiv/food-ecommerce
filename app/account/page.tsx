import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AccountPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">My Account</h1>
        <p className="text-base text-muted-foreground">
          Manage your profile, saved addresses, and order history in one place.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/account/profile">My Profile</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/addresses">Saved Addresses</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/orders">Order History</Link>
        </Button>
      </div>
    </div>
  )
}
