import { NextResponse } from "next/server"
import { createHash, randomInt } from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { products as staticProducts } from "@/lib/products"
import { getAuthUser } from "@/lib/auth"

const schema = z.object({
  bookingFor: z.enum(["self", "other"]).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(99),
      })
    )
    .min(1),
  customer: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    phone: z.string().min(8).max(20),
  }),
  address: z.object({
    line1: z.string().min(3).max(120),
    line2: z.string().max(120).optional(),
    city: z.string().min(2).max(60),
    state: z.string().min(2).max(60),
    postalCode: z.string().min(4).max(12),
  }),
  payment: z.object({
    utrNumber: z.string().min(6).max(60),
    upiId: z.string().min(3).max(100),
    screenshotUrl: z
      .string()
      .regex(/^\/api\/orders\/proof\/[a-zA-Z0-9\-_.]+\.(jpg|jpeg|png|webp)$/)
      .optional(),
  }),
})

function buildOrderNumber(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const suffix = String(randomInt(0, 1_000_000)).padStart(6, "0")
  return `EK-${yy}${mm}${dd}-${suffix}`
}

function getUploadOwnerKey(user: { userId?: string | null; email?: string | null }) {
  const base = String(user.userId ?? user.email ?? "anon").toLowerCase().trim()
  return createHash("sha256").update(base).digest("hex").slice(0, 16)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { items, customer, address, payment, bookingFor } = parsed.data
    const authUser = await getAuthUser()

    const slugify = (input: string) =>
      input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")

    const looksLikeObjectId = (value: string) => /^[a-f0-9]{24}$/i.test(value)

    const staticIdToSlug = new Map(
      staticProducts.map((product) => [product.id, slugify(product.name)]),
    )
    const staticProductsById = new Map(
      staticProducts.map((product) => [product.id, product]),
    )

    const objectIds = items
      .map((item) => item.productId)
      .filter((productId) => looksLikeObjectId(productId))
    const staticSlugs = items
      .map((item) => item.productId)
      .filter((productId) => !looksLikeObjectId(productId))
      .map((productId) => staticIdToSlug.get(productId))
      .filter((slug): slug is string => Boolean(slug))

    const [productsById, productsBySlug] = await Promise.all([
      objectIds.length > 0
        ? prisma.product.findMany({ where: { id: { in: objectIds } } })
        : Promise.resolve([]),
      staticSlugs.length > 0
        ? prisma.product.findMany({ where: { slug: { in: staticSlugs } } })
        : Promise.resolve([]),
    ])
    const dbProducts = [...productsById, ...productsBySlug]
    const dbProductsById = new Map(dbProducts.map((product) => [product.id, product]))
    const dbProductsBySlug = new Map(dbProducts.map((product) => [product.slug, product]))

    const itemRows: Array<{
      productId: string
      name: string
      pricePaise: number
      quantity: number
    }> = []

    for (const item of items) {
      const directMatch = looksLikeObjectId(item.productId)
        ? dbProductsById.get(item.productId)
        : null
      const slug = staticIdToSlug.get(item.productId)
      const slugMatch = slug ? dbProductsBySlug.get(slug) : null
      let product = directMatch ?? slugMatch

      // Backfill missing products from static catalog when old cart ids are used.
      if (!product) {
        const staticProduct = staticProductsById.get(item.productId)
        if (staticProduct) {
          const staticSlug = slugify(staticProduct.name)
          product = await prisma.product.upsert({
            where: { slug: staticSlug },
            update: {},
            create: {
              name: staticProduct.name,
              slug: staticSlug,
              description: staticProduct.description,
              category: staticProduct.category,
              pricePaise: Math.round(staticProduct.price * 100),
              imageUrl: staticProduct.image ?? null,
              isVeg: Boolean(staticProduct.isVeg),
              spiceLevel: staticProduct.spiceLevel ?? null,
              weight: staticProduct.weight ?? null,
              shelfLife: staticProduct.shelfLife ?? null,
            },
          })
          dbProductsById.set(product.id, product)
          dbProductsBySlug.set(product.slug, product)
        }
      }

      if (!product) {
        throw new Error("Product not found")
      }
      itemRows.push({
        productId: product.id,
        name: product.name,
        pricePaise: product.pricePaise,
        quantity: item.quantity,
      })
    }

    const subtotalPaise = itemRows.reduce(
      (sum, row) => sum + row.pricePaise * row.quantity,
      0
    )
    const shippingPaise = subtotalPaise >= 50000 ? 0 : 4900
    const taxPaise = 0
    const totalPaise = subtotalPaise + shippingPaise + taxPaise
    const orderNumber = buildOrderNumber()

    // Keep user profile in sync for future "book for myself" autofill.
    if (bookingFor === "self" && authUser) {
      const userById = await prisma.user.findUnique({ where: { id: authUser.userId } })
      const userByEmail = !userById
        ? await prisma.user.findUnique({ where: { email: authUser.email } })
        : null
      const targetUser = userById ?? userByEmail
      if (targetUser) {
        await prisma.user.update({
          where: { id: targetUser.id },
          data: {
            name: customer.name,
            // Do not overwrite email with untrusted input to avoid account takeover
            phone: customer.phone,
            addressLine1: address.line1,
            addressLine2: address.line2 ?? null,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
          },
        })
      }
    }

    let paymentScreenshotUrl: string | undefined
    if (payment.screenshotUrl) {
      if (!authUser) {
        return NextResponse.json({ error: "Please log in before uploading payment screenshot." }, { status: 401 })
      }

      const filename = payment.screenshotUrl.split("/").pop() ?? ""
      const expectedPrefix = `tmp-${getUploadOwnerKey(authUser)}-`
      if (!filename.startsWith(expectedPrefix)) {
        return NextResponse.json({ error: "Invalid payment screenshot reference." }, { status: 400 })
      }

      paymentScreenshotUrl = payment.screenshotUrl
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: authUser && looksLikeObjectId(authUser.userId) ? authUser.userId : undefined,
        status: "awaiting_payment_approval",
        paymentMethod: "upi",
        paymentStatus: "pending_review",
        paymentUtr: payment.utrNumber,
        paymentUpiId: payment.upiId,
        paymentScreenshotUrl,
        subtotalPaise,
        shippingPaise,
        taxPaise,
        totalPaise,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        addressLine1: address.line1,
        addressLine2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        items: {
          create: itemRows,
        },
      },
    })

    return NextResponse.json({
      orderId: order.id,
      orderNumber: (order as any).orderNumber ?? orderNumber,
      message: "Order submitted. Payment verification pending admin approval.",
    })
  } catch (error) {
    console.error("orders POST error:", error)
    return NextResponse.json(
      { error: "Unable to place order right now. Please try again." },
      { status: 500 },
    )
  }
}
