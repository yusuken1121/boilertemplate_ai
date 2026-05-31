import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createNotionRecordWriter } from "@/infrastructure/notion"
import {
  contactNotionConfig,
  ContactSubmission,
} from "@/infrastructure/notion/contact.config"
import { CreateNotionRecordUseCase } from "@/core/use-cases/create-notion-record.use-case"

const NotionContactInputSchema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  message: z.string().min(1, "メッセージを入力してください"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedInput = NotionContactInputSchema.parse(body)

    // Composition Root: Instantiate Infrastructure Adapter
    const writer = createNotionRecordWriter<ContactSubmission>(contactNotionConfig)

    // Dependency Injection: Pass Adapter into Core Use Case
    const useCase = new CreateNotionRecordUseCase<ContactSubmission>(writer)

    // Execute Use Case
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
