import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { OrderModel, ProductModel, UserModel } from "@/lib/models"

type SelectMap = Record<string, boolean>
type SortOrder = "asc" | "desc"

function toId(value: unknown) {
  if (!value) return null
  if (typeof value === "string") return value
  if (value instanceof mongoose.Types.ObjectId) return value.toString()
  return null
}

function isObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value)
}

function stripUndefined<T extends Record<string, unknown>>(input: T) {
  const output: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "undefined") {
      output[key] = value
    }
  }
  return output as T
}

function pickFields<T extends Record<string, unknown>>(data: T, select?: SelectMap) {
  if (!select) return data
  const selected: Record<string, unknown> = {}
  for (const [key, enabled] of Object.entries(select)) {
    if (enabled) selected[key] = data[key]
  }
  return selected as T
}

function mapUser(user: any) {
  return {
    id: toId(user._id),
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name ?? null,
    phone: user.phone ?? null,
    addressLine1: user.addressLine1 ?? null,
    addressLine2: user.addressLine2 ?? null,
    city: user.city ?? null,
    state: user.state ?? null,
    postalCode: user.postalCode ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function mapProduct(product: any) {
  return {
    id: toId(product._id),
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    category: product.category,
    pricePaise: product.pricePaise,
    imageUrl: product.imageUrl ?? null,
    isVeg: Boolean(product.isVeg),
    spiceLevel: product.spiceLevel ?? null,
    weight: product.weight ?? null,
    shelfLife: product.shelfLife ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

function mapOrder(order: any) {
  return {
    id: toId(order._id),
    orderNumber: order.orderNumber ?? null,
    userId: toId(order.userId),
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentUtr: order.paymentUtr,
    paymentUpiId: order.paymentUpiId,
    paymentScreenshotUrl: order.paymentScreenshotUrl,
    paymentSubmittedAt: order.paymentSubmittedAt,
    paymentVerifiedAt: order.paymentVerifiedAt ?? null,
    paymentVerifiedBy: order.paymentVerifiedBy ?? null,
    paymentRemark: order.paymentRemark ?? null,
    subtotalPaise: order.subtotalPaise,
    taxPaise: order.taxPaise,
    shippingPaise: order.shippingPaise,
    totalPaise: order.totalPaise,
    currency: order.currency,
    razorpayOrderId: order.razorpayOrderId ?? null,
    razorpayPaymentId: order.razorpayPaymentId ?? null,
    razorpaySignature: order.razorpaySignature ?? null,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    addressLine1: order.addressLine1,
    addressLine2: order.addressLine2 ?? null,
    city: order.city,
    state: order.state,
    postalCode: order.postalCode,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: (order.items ?? []).map((item: any) => ({
      id: toId(item._id),
      productId: toId(item.productId),
      name: item.name,
      pricePaise: item.pricePaise,
      quantity: item.quantity,
      reviewRating:
        typeof item.reviewRating === "number" ? Number(item.reviewRating) : null,
      reviewComment: item.reviewComment ?? null,
      reviewCreatedAt: item.reviewCreatedAt ?? null,
    })),
  }
}

async function ensureConnection() {
  await connectDB()
}

export const prisma = {
  user: {
    async findUnique({
      where,
      select,
    }: {
      where: { id?: string; email?: string }
      select?: SelectMap
    }) {
      await ensureConnection()
      const filter: Record<string, unknown> = {}
      if (where.id) {
        if (!isObjectId(where.id)) return null
        filter._id = new mongoose.Types.ObjectId(where.id)
      }
      if (where.email) {
        filter.email = where.email.trim().toLowerCase()
      }
      const user = await UserModel.findOne(filter).lean()
      if (!user) return null
      return pickFields(mapUser(user), select)
    },
    async create({
      data,
      select,
    }: {
      data: {
        email: string
        name?: string | null
        passwordHash: string
        phone?: string | null
        addressLine1?: string | null
        addressLine2?: string | null
        city?: string | null
        state?: string | null
        postalCode?: string | null
      }
      select?: SelectMap
    }) {
      await ensureConnection()
      const user = await UserModel.create({
        email: data.email.trim().toLowerCase(),
        name: data.name ?? null,
        passwordHash: data.passwordHash,
        phone: data.phone ?? null,
        addressLine1: data.addressLine1 ?? null,
        addressLine2: data.addressLine2 ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        postalCode: data.postalCode ?? null,
      })
      return pickFields(mapUser(user.toObject()), select)
    },
    async update({
      where,
      data,
    }: {
      where: { id: string }
      data: {
        passwordHash?: string
        name?: string | null
        email?: string
        phone?: string | null
        addressLine1?: string | null
        addressLine2?: string | null
        city?: string | null
        state?: string | null
        postalCode?: string | null
      }
    }) {
      await ensureConnection()
      if (!isObjectId(where.id)) {
        throw new Error("Invalid user id")
      }
      const updateData = { ...data }
      if (typeof updateData.email === "string") {
        updateData.email = updateData.email.trim().toLowerCase()
      }
      const user = await UserModel.findByIdAndUpdate(
        where.id,
        { $set: stripUndefined(updateData) },
        { new: true },
      ).lean()
      if (!user) throw new Error("User not found")
      return mapUser(user)
    },
  },
  product: {
    async findMany({
      where,
      orderBy,
    }: {
      where?: { id?: { in: string[] }; slug?: { in: string[] } }
      orderBy?: { createdAt: SortOrder }
    }) {
      await ensureConnection()
      const filter: Record<string, unknown> = {}
      if (where?.id?.in) {
        const ids = where.id.in.filter(isObjectId).map((id) => new mongoose.Types.ObjectId(id))
        filter._id = { $in: ids }
      }
      if (where?.slug?.in) {
        filter.slug = { $in: where.slug.in }
      }
      const sort = orderBy?.createdAt ? { createdAt: orderBy.createdAt === "desc" ? -1 : 1 } : {}
      const products = await ProductModel.find(filter).sort(sort).lean()
      return products.map(mapProduct)
    },
    async findUnique({ where }: { where: { id?: string; slug?: string } }) {
      await ensureConnection()
      const filter: Record<string, unknown> = {}
      if (where.id) {
        if (!isObjectId(where.id)) return null
        filter._id = new mongoose.Types.ObjectId(where.id)
      }
      if (where.slug) {
        filter.slug = where.slug
      }
      const product = await ProductModel.findOne(filter).lean()
      return product ? mapProduct(product) : null
    },
    async create({ data }: { data: Record<string, unknown> }) {
      await ensureConnection()
      const product = await ProductModel.create(data)
      return mapProduct(product.toObject())
    },
    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      await ensureConnection()
      if (!isObjectId(where.id)) throw new Error("Invalid product id")
      const product = await ProductModel.findByIdAndUpdate(
        where.id,
        { $set: stripUndefined(data) },
        { new: true },
      ).lean()
      if (!product) throw new Error("Product not found")
      return mapProduct(product)
    },
    async delete({ where }: { where: { id: string } }) {
      await ensureConnection()
      if (!isObjectId(where.id)) throw new Error("Invalid product id")
      const deleted = await ProductModel.findByIdAndDelete(where.id).lean()
      if (!deleted) throw new Error("Product not found")
      return mapProduct(deleted)
    },
    async upsert({
      where,
      update,
      create,
    }: {
      where: { slug: string }
      update: Record<string, unknown>
      create: Record<string, unknown>
    }) {
      await ensureConnection()
      const product = await ProductModel.findOneAndUpdate(
        { slug: where.slug },
        {
          $setOnInsert: create,
          $set: update,
        },
        { upsert: true, new: true },
      ).lean()
      if (!product) throw new Error("Unable to upsert product")
      return mapProduct(product)
    },
  },
  order: {
    async create({
      data,
    }: {
      data: Record<string, unknown> & { items?: { create?: Array<Record<string, unknown>> } }
    }) {
      await ensureConnection()
      const { items, ...rest } = data
      const mappedItems = (items?.create ?? []).map((item, idx) => {
        // If productId is a string, ensure it's a valid ObjectId before converting.
        if (typeof item.productId === "string") {
          if (isObjectId(item.productId)) {
            return { ...item, productId: new mongoose.Types.ObjectId(item.productId) }
          }
          // Invalid ObjectId string provided - fail fast with context
          throw new Error(`Invalid productId '${item.productId}' for order item at index ${idx}`)
        }
        return { ...item }
      })
      const order = await OrderModel.create({
        ...rest,
        items: mappedItems,
      })
      return mapOrder(order.toObject())
    },
    async findUnique({
      where,
      select,
    }: {
      where: { id?: string; orderNumber?: string }
      select?: SelectMap & {
        items?: { select?: SelectMap }
      }
    }) {
      await ensureConnection()
      const filter: Record<string, unknown> = {}
      if (where.id) {
        if (!isObjectId(where.id)) return null
        filter._id = new mongoose.Types.ObjectId(where.id)
      }
      if (where.orderNumber) {
        filter.orderNumber = where.orderNumber.trim().toUpperCase()
      }
      const order = await OrderModel.findOne(filter).lean()
      if (!order) return null
      const mapped = mapOrder(order)
      if (!select) return mapped

      const output: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(select)) {
        if (!value) continue
        if (key === "items" && typeof value === "object" && value) {
          const itemSelect = (value as { select?: SelectMap }).select
          output.items = mapped.items.map((item: Record<string, unknown>) => pickFields(item, itemSelect))
          continue
        }
        output[key] = (mapped as Record<string, unknown>)[key]
      }
      return output
    },
    async findMany({
      where,
      orderBy,
      include,
    }: {
      where?: {
        userId?: string
        customerEmail?: string
        status?: string
        paymentStatus?: string
      }
      orderBy?: { createdAt: SortOrder }
      include?: {
        items?: boolean
        user?: { select?: SelectMap }
      }
    }) {
      await ensureConnection()
      const sort = orderBy?.createdAt ? { createdAt: orderBy.createdAt === "desc" ? -1 : 1 } : {}
      const filter: Record<string, unknown> = {}
      if (where?.userId && isObjectId(where.userId)) {
        filter.userId = new mongoose.Types.ObjectId(where.userId)
      }
      if (where?.customerEmail) {
        filter.customerEmail = where.customerEmail.trim().toLowerCase()
      }
      if (where?.status) {
        filter.status = where.status
      }
      if (where?.paymentStatus) {
        filter.paymentStatus = where.paymentStatus
      }
      const orders = await OrderModel.find(filter).sort(sort).lean()
      const mappedOrders = orders.map(mapOrder)

      if (include?.user) {
        const userIds = Array.from(
          new Set(
            mappedOrders
              .map((order) => order.userId)
              .filter((userId): userId is string => typeof userId === "string" && isObjectId(userId)),
          ),
        )
        const users = userIds.length
          ? await UserModel.find({
              _id: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
            }).lean()
          : []
        const userById = new Map(users.map((user) => [toId(user._id), pickFields(mapUser(user), include.user?.select)]))
        return mappedOrders.map((order) => ({
          ...order,
          user: order.userId ? userById.get(order.userId) ?? null : null,
          ...(include.items ? {} : { items: undefined }),
        }))
      }

      return mappedOrders.map((order) => ({
        ...order,
        ...(include?.items ? {} : { items: undefined }),
      }))
    },
    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      await ensureConnection()
      if (!isObjectId(where.id)) throw new Error("Invalid order id")
      const order = await OrderModel.findByIdAndUpdate(where.id, { $set: stripUndefined(data) }, { new: true }).lean()
      if (!order) throw new Error("Order not found")
      return mapOrder(order)
    },
    async updateMany({
      where,
      data,
    }: {
      where: { razorpayOrderId?: string }
      data: Record<string, unknown>
    }) {
      await ensureConnection()
      const filter = stripUndefined(where as Record<string, unknown>)
      if (Object.keys(filter).length === 0) {
        throw new Error("Refusing to run updateMany with empty filter")
      }
      const result = await OrderModel.updateMany(filter, { $set: stripUndefined(data) })
      return { count: result.modifiedCount }
    },
  },
}
