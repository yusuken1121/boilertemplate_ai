import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { optionalEnv, serverEnv } from "@/lib/env"
import * as schema from "./schema"

type Database = ReturnType<typeof createDatabase>

function createDatabase() {
  const client = postgres(serverEnv("DATABASE_URL"), {
    // Serverless runtimes recycle instances; a small pool avoids exhausting
    // Postgres connections across many warm lambdas.
    max: Number(optionalEnv("DATABASE_POOL_MAX", "5")),
    prepare: false,
  })

  return drizzle(client, { schema })
}

let instance: Database | undefined

/**
 * The Drizzle client, created on first use.
 *
 * Lazy on purpose: importing this module must not require DATABASE_URL, so a
 * project that has not set up a database can still build and run the features
 * that do not touch it.
 */
export function getDb(): Database {
  instance ??= createDatabase()
  return instance
}

export { schema }
