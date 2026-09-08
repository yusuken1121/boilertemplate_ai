import { z } from "zod"
import "@/lib/zod/zod-config"

export const PASSWORD_MIN_LENGTH = 8

/**
 * The credentials contract. `auth.ts` validates against it inside the
 * Credentials provider and the sign-in form reuses it, so the two cannot
 * drift. Safe on the client: a plain schema with no server imports.
 */
export const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
})

export type CredentialsInput = z.infer<typeof credentialsSchema>
