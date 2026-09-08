import { z } from "zod"
import "@/lib/zod/zod-config"
import { CONTACT_MESSAGE_MIN_LENGTH } from "./domain/contact-submission.entity"

/**
 * HTTP boundary validation for POST /api/contact.
 * Shape and format only — the message-length business rule is a domain rule,
 * enforced by `assertValidContactSubmission` inside the Use Case.
 */
export const contactSubmissionSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  message: z.string().min(1),
})

/**
 * Client form validation. Mirrors the server schema and additionally applies
 * the domain rule up-front, so the user sees it before a round trip.
 */
export const contactFormSchema = contactSubmissionSchema.extend({
  message: z.string().min(CONTACT_MESSAGE_MIN_LENGTH),
})

export type ContactSubmissionRequest = z.infer<typeof contactSubmissionSchema>
export type ContactFormValues = z.infer<typeof contactFormSchema>

/** Anonymous quota for POST /api/contact, keyed by client IP. */
export const CONTACT_RATE_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 }
