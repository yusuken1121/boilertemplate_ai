import type { NextConfig } from "next"

const isProduction = process.env.NODE_ENV === "production"

/**
 * Baseline security headers.
 *
 * A Content-Security-Policy is deliberately NOT set here: a correct one for
 * the App Router needs a per-request nonce, which belongs in middleware.ts.
 * See `.cursor/skills/project-setup/SKILL.md` for the starting point.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
]

const nextConfig: NextConfig = {
  // Emits a self-contained server bundle for the Docker image.
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
