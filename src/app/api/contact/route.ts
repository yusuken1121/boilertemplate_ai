import { NextResponse, type NextRequest } from "next/server"
import { createNotionRecordWriter } from "@/infrastructure/notion"
import { CreateNotionRecordUseCase } from "@/core/use-cases/create-notion-record.use-case"
import { assertValidContactSubmission } from "@/features/contact/domain/contact-submission.entity"
import { createContactNotionConfig } from "@/features/contact/notion/contact-database.config"
import { contactSubmissionSchema } from "@/features/contact/contact.schema"
import { handleRouteError } from "@/lib/route-error"

export async function POST(req: NextRequest) {
  try {
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
