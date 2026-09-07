import { z } from "zod"

/**
 * Server-only environment variables.
 *
 * Validated **lazily, per key** rather than all at once at import time:
 * a project that only uses Chat must not be forced to configure Notion.
 * Never read `process.env` for a secret outside this module.
 *
 * NOTE: to make a client-side import a build error, install the `server-only`
 * package and add `import "server-only"` as the first line of this file.
 */
const serverEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
  NOTION_TOKEN: z.string().min(1),
  NOTION_CONTACT_DATABASE_ID: z.string().min(1),
})

export type ServerEnvKey = keyof z.infer<typeof serverEnvSchema>

export class MissingEnvVarError extends Error {
  constructor(readonly key: ServerEnvKey) {
    super(`Environment variable "${key}" is not set. See .env.example.`)
    this.name = "MissingEnvVarError"
  }
}

/**
 * Read a required server environment variable.
 *
 * @throws {MissingEnvVarError} when the variable is missing or empty.
 */
export function serverEnv(key: ServerEnvKey): string {
  const result = serverEnvSchema.shape[key].safeParse(process.env[key])

  if (!result.success) {
    throw new MissingEnvVarError(key)
  }

  return result.data
}
