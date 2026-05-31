import type { Message, MessageRole } from "@/core/domain/message.entity"

export type { Message, MessageRole }

export interface ChatSession {
  id: string
  messages: Message[]
}
