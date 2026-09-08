import type { ILogger, LogContext } from "@/core/ports/logger.port"

/**
 * The process-wide logger.
 *
 * `no-console` is a lint error everywhere else, so every log line passes
 * through here and swapping the destination is a one-call change. Isomorphic:
 * the default writes to the console on both the server and the client.
 *
 * To send server logs to Sentry / pino / a log drain, call `setLogger()` once
 * from `instrumentation.ts` (server) or a top-level provider (client).
 */

const LEVELS = ["debug", "info", "warn", "error"] as const
type Level = (typeof LEVELS)[number]

const minLevel: Level = process.env.NODE_ENV === "production" ? "info" : "debug"

function enabled(level: Level): boolean {
  return LEVELS.indexOf(level) >= LEVELS.indexOf(minLevel)
}

/** Single-line JSON in production so a log drain can parse it; readable locally. */
function emit(level: Level, message: string, context?: LogContext): void {
  if (!enabled(level)) return

  const write = level === "debug" ? console.debug : console[level]

  if (process.env.NODE_ENV === "production") {
    write(JSON.stringify({ level, message, ...context }))
    return
  }

  if (context && Object.keys(context).length > 0) {
    write(`[${level}] ${message}`, context)
  } else {
    write(`[${level}] ${message}`)
  }
}

export const consoleLogger: ILogger = {
  debug: (message, context) => emit("debug", message, context),
  info: (message, context) => emit("info", message, context),
  warn: (message, context) => emit("warn", message, context),
  error: (message, error, context) =>
    emit("error", message, {
      ...context,
      ...(error === undefined ? {} : { cause: serializeError(error) }),
    }),
}

function serializeError(error: unknown): unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.cause === undefined
        ? {}
        : { cause: serializeError(error.cause) }),
    }
  }
  return error
}

let current: ILogger = consoleLogger

/** Replace the destination. Call once, at startup. */
export function setLogger(next: ILogger): void {
  current = next
}

export const logger: ILogger = {
  debug: (message, context) => current.debug(message, context),
  info: (message, context) => current.info(message, context),
  warn: (message, context) => current.warn(message, context),
  error: (message, error, context) => current.error(message, error, context),
}
