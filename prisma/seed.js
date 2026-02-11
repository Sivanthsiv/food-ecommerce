const { PrismaClient } = require("@prisma/client")
const { products } = require("../lib/products")

const prisma = new PrismaClient()

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

async function main() {
  const existing = await prisma.product.findMany({ select: { id: true } })
  if (existing.length > 0) {
    console.log("Products already exist. Skipping seed.")
    return
  }

  const data = products.map((p) => ({
    name: p.name,
    slug: slugify(p.name),
    description: p.description,
    category: p.category,
    pricePaise: Math.round(p.price * 100),
    imageUrl: p.image ?? null,
    isVeg: Boolean(p.isVeg),
    spiceLevel: p.spiceLevel ?? null,
    weight: p.weight ?? null,
    shelfLife: p.shelfLife ?? null,
  }))

  await prisma.product.createMany({ data })
  console.log(`Seeded ${data.length} products.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
