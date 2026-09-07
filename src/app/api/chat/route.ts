import { NextResponse, type NextRequest } from "next/server"
import { createGeminiGateway } from "@/infrastructure/gemini"
import { SendMessageUseCase } from "@/features/chat/use-cases/send-message.use-case"
import { chatRequestSchema } from "@/features/chat/chat.schema"
import { handleRouteError } from "@/lib/route-error"

export async function POST(req: NextRequest) {
  try {
    const { stream, messages, options } = chatRequestSchema.parse(
      await req.json(),
    )

    const useCase = new SendMessageUseCase(createGeminiGateway())

    if (!stream) {
      const response = await useCase.executeNonStreaming({ messages, options })
      return NextResponse.json({ response })
    }

    const { stream: body } = await useCase.execute({ messages, options })

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    return handleRouteError(error, "POST /api/chat")
  }
}
