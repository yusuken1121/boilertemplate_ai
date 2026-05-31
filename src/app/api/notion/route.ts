import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createNotionRecordWriter } from "@/infrastructure/notion"
import { contactNotionConfig } from "@/infrastructure/notion/contact.config"
import { CreateNotionRecordUseCase } from "@/core/use-cases/create-notion-record.use-case"
import type { ContactSubmission } from "@/core/domain/contact-submission.entity"
import { contactSubmissionSchema } from "@/lib/validators/notion.schema"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedInput = contactSubmissionSchema.parse(body)

    const writer = createNotionRecordWriter<ContactSubmission>(contactNotionConfig)
    const useCase = new CreateNotionRecordUseCase<ContactSubmission>(writer)
    const result = await useCase.execute(validatedInput)

    return NextResponse.json({ success: true, page: result })
  } catch (error) {
    console.error("Error in /api/notion Route Handler:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((e) => e.message).join(", ")
      return NextResponse.json(
        { error: `Validation error: ${errorMessage}` },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    )
  }
}
