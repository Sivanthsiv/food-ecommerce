import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose"

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: null },
    phone: { type: String, default: null },
    addressLine1: { type: String, default: null },
    addressLine2: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    postalCode: { type: String, default: null },
  },
  { timestamps: true },
)

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: null },
    category: { type: String, required: true, trim: true },
    pricePaise: { type: Number, required: true },
    imageUrl: { type: String, default: null },
    isVeg: { type: Boolean, default: true },
    spiceLevel: { type: String, default: null },
    weight: { type: String, default: null },
    shelfLife: { type: String, default: null },
  },
  { timestamps: true },
)

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    name: { type: String, required: true },
    pricePaise: { type: Number, required: true },
    quantity: { type: Number, required: true },
    reviewRating: { type: Number, default: null },
    reviewComment: { type: String, default: null },
    reviewCreatedAt: { type: Date, default: null },
  },
  { _id: true },
)

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    userId: { type: Schema.Types.ObjectId, default: null, ref: "User" },
    status: { type: String, default: "pending" },
    paymentMethod: { type: String, default: "upi" },
    paymentStatus: { type: String, default: "pending_review" },
    paymentUtr: { type: String, required: true },
    paymentUpiId: { type: String, required: true },
    paymentScreenshotUrl: { type: String, default: null },
    paymentSubmittedAt: { type: Date, default: Date.now },
    paymentVerifiedAt: { type: Date, default: null },
    paymentVerifiedBy: { type: String, default: null },
    paymentRemark: { type: String, default: null },
    subtotalPaise: { type: Number, required: true },
    taxPaise: { type: Number, required: true, default: 0 },
    shippingPaise: { type: Number, required: true, default: 0 },
    totalPaise: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: null },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    items: { type: [orderItemSchema], default: [] },
  },
  { timestamps: true },
)

export type UserDoc = InferSchemaType<typeof userSchema>
export type ProductDoc = InferSchemaType<typeof productSchema>
export type OrderDoc = InferSchemaType<typeof orderSchema>

export const UserModel: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>("User", userSchema)
export const ProductModel: Model<ProductDoc> =
  (mongoose.models.Product as Model<ProductDoc>) || mongoose.model<ProductDoc>("Product", productSchema)
if (mongoose.models.Order) {
  // delete existing model to allow schema updates during dev reloads
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete mongoose.models.Order
}
export const OrderModel: Model<OrderDoc> =
  (mongoose.models.Order as Model<OrderDoc>) || mongoose.model<OrderDoc>("Order", orderSchema)
