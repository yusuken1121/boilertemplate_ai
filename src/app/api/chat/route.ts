import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createGeminiGateway } from "@/infrastructure/gemini"
import { SendMessageUseCase } from "@/core/use-cases/send-message.use-case"

const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Message content cannot be empty"),
  createdAt: z.coerce.date(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const SendMessageInputSchema = z.object({
  messages: z.array(MessageSchema).min(1, "At least one message is required"),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
      topP: z.number().min(0).max(1).optional(),
      model: z.string().optional(),
      systemPrompt: z.string().optional(),
    })
    .optional(),
  stream: z.boolean().optional().default(true),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedInput = SendMessageInputSchema.parse(body)

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
    } else {
      const text = await sendMessageUseCase.executeNonStreaming({
        messages: validatedInput.messages,
        options: validatedInput.options,
      })
      return NextResponse.json({ response: text })
    }
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
