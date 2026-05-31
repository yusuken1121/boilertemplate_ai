import { CHAT_FORM_KEYS } from "@/constants/labels"
import z from "zod"

export const chatFormSchema = z.object({
  [CHAT_FORM_KEYS.MESSAGE]: z.string().min(1),
})

export type ChatFormValues = z.infer<typeof chatFormSchema>
