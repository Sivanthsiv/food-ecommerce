import React from "react"
import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import { DbAutoConnect } from "@/components/db-auto-connect"
import './globals.css'

const _dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const _playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: 'EasyKitchen - Homemade Veg Foods | Ready-to-Eat, Instant & Powders',
  description: '100% vegetarian, homemade ready-to-eat and instant products, chutney powders, and masala powders. No preservatives, long shelf life, and ready in minutes.',
  generator: 'v0.app',
  icons: {
    icon: '/easy-kitchen-logo.jpg',
    apple: '/easy-kitchen-logo.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <DbAutoConnect />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}


