import { NextResponse, type NextRequest } from "next/server"
import { createNotionRecordWriter } from "@/infrastructure/notion"
import { CreateNotionRecordUseCase } from "@/core/use-cases/create-notion-record.use-case"
import { assertValidContactSubmission } from "@/features/contact/domain/contact-submission.entity"
import { createContactNotionConfig } from "@/features/contact/notion/contact-database.config"
import {
  CONTACT_RATE_LIMIT,
  contactSubmissionSchema,
} from "@/features/contact/contact.schema"
import { clientKey, enforceRateLimit } from "@/lib/rate-limit"
import { handleRouteError } from "@/lib/route-error"

/**
 * Public endpoint — a contact form that required an account would be useless.
 * That makes the rate limit load-bearing rather than a nicety: it is the only
 * thing between an anonymous caller and unbounded writes to the Notion database.
 */
export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(clientKey(req), CONTACT_RATE_LIMIT)

    const submission = contactSubmissionSchema.parse(await req.json())

    const useCase = new CreateNotionRecordUseCase(
      createNotionRecordWriter(createContactNotionConfig()),
      assertValidContactSubmission,
    )

    const page = await useCase.execute(submission)

    return NextResponse.json({ success: true, page })
  } catch (error) {
    return handleRouteError(error, "POST /api/contact")
  }
}
