/**
 * Base class for all domain (business rule) violations.
 *
 * Route Handlers translate any `DomainError` into HTTP 400 via
 * `handleRouteError` — so a new domain rule needs no changes there.
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}
