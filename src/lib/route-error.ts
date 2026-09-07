import { NextResponse } from "next/server"
import { z } from "zod"
import { DomainError } from "@/core/domain/domain.error"

export type ApiErrorBody = { error: string }

const isProduction = process.env.NODE_ENV === "production"

/**
 * Translates any thrown value into a JSON error response.
 *
 * - Zod validation failure → 400
 * - Domain rule violation (`DomainError` subclass) → 400
 * - Anything else → 500, with the raw message hidden in production so that
 *   SDK/internal details never reach the client.
 */
export function handleRouteError(
  error: unknown,
  context: string,
): NextResponse<ApiErrorBody> {
  console.error(`Error in ${context}:`, error)

  if (error instanceof z.ZodError) {
    const detail = error.issues.map((issue) => issue.message).join(", ")
    return NextResponse.json({ error: detail }, { status: 400 })
  }

  if (error instanceof DomainError) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const detail =
    !isProduction && error instanceof Error ? error.message : undefined

  return NextResponse.json(
    { error: detail ?? "Internal Server Error" },
    { status: 500 },
  )
}
