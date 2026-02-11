import Image from "next/image"
import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

const footerNavigation = {
  shop: [
    { name: "All Products", href: "/shop" },
    { name: "Breakfast", href: "/shop?category=breakfast" },
    { name: "Lunch", href: "/shop?category=lunch" },
    { name: "Dinner", href: "/shop?category=dinner" },
    { name: "Snacks", href: "/shop?category=snacks" },
    { name: "Powders", href: "/shop?category=powders" },
    { name: "Combos", href: "/shop?category=combos" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Certifications", href: "/certifications" },
    { name: "Contact", href: "/contact" },
    { name: "FAQs", href: "/faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refund" },
    { name: "Shipping Info", href: "/shipping" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/easy-kitchen-logo.jpg"
                alt="EasyKitchen"
                width={180}
                height={56}
                className="h-12 w-auto"
              />
              <span className="font-serif text-2xl font-semibold text-primary-foreground">EasyKitchen</span>
            </Link>
            <p className="mt-4 text-sm text-background/70 max-w-md leading-relaxed">
              100% vegetarian, homemade ready-to-eat and instant products, chutney powders, and masala powders. 
              No preservatives, long shelf life, and ready in minutes.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>hello@EasyKitchen.in</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+91 8722641378</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-background/70">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>#974, 2nd main, Vijayanagara, Bangalore, Karnataka 560040</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground">Shop</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.shop.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-background/70 hover:text-primary-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-background/70 hover:text-primary-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-background/70 hover:text-primary-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Certifications & Copyright */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs text-background/60">
                <span className="px-2 py-1 bg-background/10 rounded">FSSAI</span>
                <span>Lic. No: 10012345678901</span>
              </div>
            </div>
            <p className="text-xs text-background/60">
              &copy; {new Date().getFullYear()} EasyKitchen Foods Pvt. Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}




