/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  // Dev helper: explicitly allow dev origins to silence cross-origin dev warnings.
  // Set via comma-separated env var (ALLOWED_DEV_ORIGINS="http://172.16.62.107")
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS ? process.env.ALLOWED_DEV_ORIGINS.split(",") : [],
  async headers() {
    const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000"
    if (process.env.NODE_ENV === "production" && corsOrigin === "*") {
      throw new Error('Invalid CORS_ORIGIN in production: "*" is not allowed when credentials are enabled')
    }

    // Common security headers applied site-wide
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
      // HSTS only in production
      ...(process.env.NODE_ENV === "production"
        ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
        : []),
    ]

    return [
      {
        // Apply CORS headers to API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: corsOrigin },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Vary", value: "Origin" },
          ...securityHeaders,
        ],
      },
      {
        // Apply general security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
