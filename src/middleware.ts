import NextAuth from "next-auth"
import { authConfig } from "@/features/auth/auth.config"
import { PATH } from "@/constants/path"

/**
 * Route guard.
 *
 * Must live in `src/` — a project with a `src` directory ignores a
 * `middleware.ts` at the repository root, silently and with no warning.
 *
 * Uses the edge-safe half of the Auth.js config (no database, no Node crypto),
 * so the middleware bundle stays within the Edge runtime's limits.
 *
 * Everything is protected by default: a new route is private until it is added
 * to PUBLIC_PATHS. That is the safe direction to fail.
 */
const { auth } = NextAuth(authConfig)

/**
 * Reachable without an account. A contact form behind a sign-in wall is
 * useless, so it and its endpoint are public — and rate-limited instead.
 */
const PUBLIC_PATHS = [PATH.SIGN_IN, PATH.CONTACT, "/api/contact"]

export default auth((req) => {
  const { pathname } = req.nextUrl

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )

  if (isPublic || req.auth) {
    return
  }

  /**
   * An API caller gets 401 JSON, not a redirect.
   *
   * Redirecting a POST sends the client a 302 to an HTML sign-in page; fetch
   * and most HTTP clients follow it and report a cheerful 200, so the failure
   * looks like success. The body matches `handleRouteError`'s shape so the
   * client parses it the same way as every other error.
   */
  if (pathname.startsWith("/api/")) {
    return Response.json({ error: "Sign in to continue" }, { status: 401 })
  }

  const signInUrl = new URL(PATH.SIGN_IN, req.nextUrl.origin)
  signInUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search)

  return Response.redirect(signInUrl)
})

export const config = {
  /**
   * Skip Next internals, static files, and the Auth.js endpoints themselves.
   * `/api/*` IS matched — an unauthenticated API call must be rejected too.
   */
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
