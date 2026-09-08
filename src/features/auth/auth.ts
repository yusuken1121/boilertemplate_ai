import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { toPublicUser } from "@/core/domain/user.entity"
import { createPasswordHasher } from "@/infrastructure/auth"
import { createUserRepository } from "@/infrastructure/db"
import { serverEnv } from "@/lib/env"
import { logger } from "@/lib/logger"
import { authConfig } from "./auth.config"
import { credentialsSchema } from "./auth.schema"

/**
 * The Auth.js instance. Node runtime only — it reaches the database.
 *
 * Client components must not import this file: it pulls in the Postgres
 * driver. `eslint.config.mjs` turns that into a lint error.
 *
 * The configuration is a function so `serverEnv("AUTH_SECRET")` runs per
 * request instead of at import time: a fresh clone with no `.env.local` must
 * still be able to `pnpm build`.
 */
export const { handlers, signIn, signOut, auth } = NextAuth(() => ({
  ...authConfig,
  secret: serverEnv("AUTH_SECRET"),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const users = createUserRepository()
        const hasher = createPasswordHasher()

        const user = await users.findByEmail(parsed.data.email)

        if (!user) {
          // Hash anyway so a missing account and a wrong password take the
          // same time — otherwise the response time enumerates valid emails.
          await hasher.hash(parsed.data.password)
          return null
        }

        const ok = await hasher.verify(parsed.data.password, user.passwordHash)
        if (!ok) {
          logger.warn("Sign-in rejected", { email: parsed.data.email })
          return null
        }

        return toPublicUser(user)
      },
    }),
  ],
}))
