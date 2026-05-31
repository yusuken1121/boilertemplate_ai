import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createGeminiGateway } from "@/infrastructure/gemini"
import { SendMessageUseCase } from "@/core/use-cases/send-message.use-case"
import { sendMessageInputSchema } from "@/lib/validators/chat.schema"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedInput = sendMessageInputSchema.parse(body)

    const aiGateway = createGeminiGateway()
    const sendMessageUseCase = new SendMessageUseCase(aiGateway)

    if (validatedInput.stream) {
      const { stream } = await sendMessageUseCase.execute({
        messages: validatedInput.messages,
        options: validatedInput.options,
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      })
    }

    const text = await sendMessageUseCase.executeNonStreaming({
      messages: validatedInput.messages,
      options: validatedInput.options,
    })
    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error in /api/chat Route Handler:", error)

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
