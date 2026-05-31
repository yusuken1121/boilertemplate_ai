import type { Message } from "@/core/domain/message.entity"

export interface PostChatMessageRequest {
  messages: Message[]
  options?: {
    temperature?: number
    maxTokens?: number
    topP?: number
    model?: string
    systemPrompt?: string
  }
}

export interface PostChatMessageResponse {
  response: string
}
