"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, ShoppingCart, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import { CartDrawer } from "@/components/cart/cart-drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { totalItems, setIsCartOpen } = useCart()
  const router = useRouter()
  const [authUser, setAuthUser] = useState<{
    id: string
    email: string
    name?: string | null
    isAdmin?: boolean
  } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        })
        const data = await res.json()
        if (!active) return
        setAuthUser(data?.user ?? null)
      } catch {
        if (!active) return
        setAuthUser(null)
      } finally {
        if (!active) return
        setAuthLoading(false)
      }
    }
    loadUser()
    return () => {
      active = false
    }
  }, [])

  const handleMenuNav = (href: string) => {
    router.push(href)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    } finally {
      setAuthUser(null)
      router.refresh()
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3">
            <Image
              src="/easy-kitchen-logo.jpg"
              alt="EasyKitchen"
              width={160}
              height={48}
              className="h-10 w-auto"
              priority
            />
            <span className="font-serif text-2xl font-semibold text-primary">EasyKitchen</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-m-2.5">
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs bg-background">
              <div className="flex items-center justify-between mb-8">
                <Link
                  href="/"
                  className="-m-1.5 p-1.5 flex items-center gap-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Image
                    src="/easy-kitchen-logo.jpg"
                    alt="EasyKitchen"
                    width={160}
                    height={48}
                    className="h-10 w-auto"
                  />
                  <span className="font-serif text-2xl font-semibold text-primary">EasyKitchen</span>
                </Link>
              </div>
              <div className="flow-root">
                <div className="-my-6 divide-y divide-border">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="py-6">
                    <Link
                      href="/faq"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      FAQs
                    </Link>
                    <Link
                      href="/certifications"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Certifications
                    </Link>
                  </div>
                  <div className="py-6">
                    <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Account
                    </p>
                    {authLoading ? (
                      <span className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground">
                        Loading...
                      </span>
                    ) : authUser ? (
                      <>
                        <Link
                          href="/account/profile"
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/account/addresses"
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Saved Addresses
                        </Link>
                        <Link
                          href="/account/orders"
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Order History
                        </Link>
                        {authUser.isAdmin && (
                          <Link
                            href="/admin"
                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          type="button"
                          className="-mx-3 block w-full rounded-lg px-3 py-2 text-left text-base font-medium text-foreground hover:bg-secondary transition-colors"
                          onClick={() => {
                            setMobileMenuOpen(false)
                            handleLogout()
                          }}
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Log in
                        </Link>
                        <Link
                          href="/signup"
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                {totalItems}
              </span>
            )}
            <span className="sr-only">Cart</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {authLoading ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : authUser ? (
                <>
                  <DropdownMenuLabel className="space-y-0.5">
                    <span className="block text-sm font-medium text-foreground">
                      {authUser.name || "My Account"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {authUser.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => handleMenuNav("/account/profile")}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleMenuNav("/account/addresses")}>
                    Saved Addresses
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleMenuNav("/account/orders")}>
                    Order History
                  </DropdownMenuItem>
                  {authUser.isAdmin && (
                    <DropdownMenuItem onSelect={() => handleMenuNav("/admin")}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>Log out</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onSelect={() => handleMenuNav("/login")}>
                    Log in
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleMenuNav("/signup")}>
                    Sign up
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <CartDrawer />
    </header>
  )
}


