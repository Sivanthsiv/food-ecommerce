export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { connectDB } = await import("./lib/mongodb")
    try {
      await connectDB()
    } catch (error) {
      console.error("Initial MongoDB connection failed:", error)
    }
  }
}
