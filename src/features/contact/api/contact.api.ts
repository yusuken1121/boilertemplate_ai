import { apiPost } from "@/lib/api/api-client"
import type { NotionPageRef } from "@/core/domain/notion-page-ref.vo"
import type { ContactSubmission } from "../domain/contact-submission.entity"

const CONTACT_ENDPOINT = "/api/contact"

export type ContactSubmitResponse = {
  success: boolean
  page: NotionPageRef
}

export const contactApi = {
  submit: (data: ContactSubmission) =>
    apiPost<ContactSubmitResponse, ContactSubmission>(CONTACT_ENDPOINT, data),
}
