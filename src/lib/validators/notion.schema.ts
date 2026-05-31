import { FORM_KEYS } from "@/constants/labels"
import z from "zod"

export const contactNotionSchema = z.object({
  [FORM_KEYS.NAME]: z.string().min(1),
  [FORM_KEYS.EMAIL]: z.string().email(),
  message: z.string().min(1),
})

export type ContactNotionValues = z.infer<typeof contactNotionSchema>
