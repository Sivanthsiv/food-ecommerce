"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Search,
  Package,
  Truck,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  MessageCircle,
  Utensils,
  Clock,
} from "lucide-react"

const categories = [
  { id: "all", label: "All Questions", icon: Search },
  { id: "products", label: "Products", icon: Utensils },
  { id: "orders", label: "Orders", icon: Package },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "returns", label: "Returns", icon: RefreshCw },
]

const faqs = [
  {
    category: "products",
    question: "How long do your products stay fresh?",
    answer:
      "Shelf life varies by product. Most ready-to-eat and instant items last 6-12 months when stored properly in a cool, dry place. Chutney and masala powders typically last longer. Each product has manufacturing and expiry dates printed on the packaging. Once opened, follow the pack instructions for best results.",
  },
  {
    category: "products",
    question: "Do your products contain preservatives?",
    answer:
      "No, our products are 100% preservative-free. We use advanced packaging and processing methods that help preserve food naturally, similar to home-cooked methods, so our products retain their nutrition and taste without artificial additives.",
  },
  {
    category: "products",
    question: "Are your products suitable for vegetarians/vegans?",
    answer:
      "All our products are 100% vegetarian. Some items contain dairy, so please check the ingredient list if you follow a vegan diet.",
  },
  {
    category: "products",
    question: "How do I prepare your ready-to-eat and instant products?",
    answer:
      "Ready-to-eat items can be heated in a microwave or pan in a few minutes. Instant mixes only need water and quick cooking. Chutney and masala powders are ready to use. Detailed instructions are provided on each product package.",
  },
  {
    category: "products",
    question: "Are your products FSSAI certified?",
    answer:
      "Yes, all our products are FSSAI certified and manufactured in an ISO-certified facility following strict food safety standards. Our FSSAI license number is displayed on all product packaging.",
  },
  {
    category: "orders",
    question: "What is the minimum order value?",
    answer:
      "There is no minimum order value. You can order as little as a single product. However, orders below â‚¹499 will incur a delivery charge of â‚¹49. Orders above â‚¹499 qualify for free delivery.",
  },
  {
    category: "orders",
    question: "Can I modify or cancel my order after placing it?",
    answer:
      "You can modify or cancel your order within 1 hour of placing it by contacting our customer support. Once the order is packed and dispatched, modifications are not possible. For cancellations after dispatch, you can refuse delivery and a refund will be initiated.",
  },
  {
    category: "orders",
    question: "How can I track my order?",
    answer:
      "Once your order is dispatched, you will receive an SMS and email with the tracking link. You can also track your order by logging into your account on our website and visiting the 'My Orders' section.",
  },
  {
    category: "orders",
    question: "Do you offer bulk orders for events or offices?",
    answer:
      "Yes! We offer special pricing for bulk orders (50+ units). Please contact us at bulk@freshbite.in or call our dedicated bulk order line for customized quotes and delivery arrangements.",
  },
  {
    category: "delivery",
    question: "Which cities do you deliver to?",
    answer:
      "We currently deliver pan-India through our logistics partners. Most metro cities receive delivery within 3-5 business days, while remote areas may take 5-7 business days. Enter your pincode at checkout to see the estimated delivery time.",
  },
  {
    category: "delivery",
    question: "What are your delivery charges?",
    answer:
      "Delivery is FREE for orders above â‚¹499. For orders below â‚¹499, a flat delivery charge of â‚¹49 applies. During special promotions, we occasionally offer free delivery with no minimum order value.",
  },
  {
    category: "delivery",
    question: "Do you offer same-day or next-day delivery?",
    answer:
      "Currently, we do not offer same-day delivery. Standard delivery takes 3-7 business days depending on your location. We are working on introducing express delivery options in select cities.",
  },
  {
    category: "delivery",
    question: "What happens if I am not available to receive the delivery?",
    answer:
      "Our delivery partner will attempt delivery up to 3 times. If you are unavailable, you can provide alternate delivery instructions or reschedule via the tracking link. Undelivered packages are returned to us and a refund is initiated.",
  },
  {
    category: "payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major payment methods including Credit/Debit Cards (Visa, Mastercard, Rupay), UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD). All online transactions are secured with 256-bit encryption.",
  },
  {
    category: "payment",
    question: "Is Cash on Delivery (COD) available?",
    answer:
      "Yes, COD is available for orders up to â‚¹5,000. For orders above this amount, we require online payment. COD availability may vary for some remote pin codes.",
  },
  {
    category: "payment",
    question: "Are there any extra charges for online payments?",
    answer:
      "No, there are no additional charges for online payments. The price you see is what you pay. We absorb all payment gateway charges.",
  },
  {
    category: "payment",
    question: "How do I use a coupon or discount code?",
    answer:
      "You can apply your coupon code at checkout in the 'Apply Coupon' field. The discount will be reflected immediately in your order total. Only one coupon can be used per order, and coupons cannot be combined.",
  },
  {
    category: "returns",
    question: "What is your return policy?",
    answer:
      "If you receive damaged or incorrect products, please contact us within 48 hours of delivery with photos. We will arrange a replacement or full refund. Due to the nature of food products, we cannot accept returns for products that have been opened or consumed.",
  },
  {
    category: "returns",
    question: "How long does it take to process refunds?",
    answer:
      "Refunds are processed within 3-5 business days after approval. The amount will be credited to your original payment method. For COD orders, refunds are processed via bank transfer â€” please keep your bank details handy.",
  },
  {
    category: "returns",
    question: "What if I receive an expired product?",
    answer:
      "This should never happen, but if it does, please contact us immediately with photos showing the expiry date. We will send a replacement at no charge and investigate the issue to prevent future occurrences.",
  },
  {
    category: "returns",
    question: "Can I exchange products for different items?",
    answer:
      "Direct exchanges are not available. If you wish to exchange, please initiate a return for the original item and place a new order for the product you want. We recommend checking our product descriptions carefully before ordering.",
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="font-serif text-4xl font-semibold text-foreground sm:text-5xl">
                How Can We Help?
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Find answers to common questions about our products, orders, 
                delivery, and more.
              </p>

              {/* Search Box */}
              <div className="mt-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  className={selectedCategory === category.id ? "" : "bg-transparent"}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 lg:px-8">
            {filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card rounded-lg border border-border px-6 data-[state=open]:border-primary/30"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No results found
                </h3>
                <p className="text-muted-foreground mb-6">
                  We could not find any questions matching your search. Try different 
                  keywords or browse by category.
                </p>
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                Quick Links
              </h2>
              <p className="mt-4 text-muted-foreground">
                Popular topics and resources
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Link
                href="/shop"
                className="bg-card rounded-lg border border-border p-6 hover:border-primary/30 transition-colors group"
              >
                <Utensils className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Browse Products
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Explore our full range of ready-to-eat and instant vegetarian products, chutney powders, and masala powders
                </p>
              </Link>

              <Link
                href="/certifications"
                className="bg-card rounded-lg border border-border p-6 hover:border-primary/30 transition-colors group"
              >
                <ShieldCheck className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Certifications
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  View our food safety certifications
                </p>
              </Link>

              <Link
                href="/contact"
                className="bg-card rounded-lg border border-border p-6 hover:border-primary/30 transition-colors group"
              >
                <MessageCircle className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Contact Support
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Get help from our customer service team
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Still Need Help CTA */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="bg-primary rounded-2xl p-8 lg:p-12 text-center text-primary-foreground">
              <Clock className="h-12 w-12 mx-auto mb-6 opacity-80" />
              <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
                Still Have Questions?
              </h2>
              <p className="mt-4 max-w-xl mx-auto opacity-80">
                Our customer support team is available Monday to Saturday, 
                9 AM to 6 PM IST. We typically respond within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <a href="mailto:support@freshbite.in">Email Support</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


