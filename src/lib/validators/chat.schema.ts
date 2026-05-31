import { CHAT_FORM_KEYS } from "@/constants/labels"
import z from "zod"

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Message content cannot be empty"),
  createdAt: z.coerce.date(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const sendMessageInputSchema = z.object({
  messages: z.array(messageSchema).min(1, "At least one message is required"),
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

export const chatFormSchema = z.object({
  [CHAT_FORM_KEYS.MESSAGE]: z.string().min(1),
})

export type SendMessageInput = z.infer<typeof sendMessageInputSchema>
export type ChatFormValues = z.infer<typeof chatFormSchema>
