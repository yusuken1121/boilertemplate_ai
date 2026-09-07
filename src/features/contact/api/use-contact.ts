import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { contactApi, type ContactSubmitResponse } from "./contact.api"
import type { ContactSubmission } from "../domain/contact-submission.entity"

export const contactKeys = {
  all: ["contact"] as const,
}

/** Submit the contact form; the server writes it to the Notion database. */
export function useSubmitContact(
  options?: UseMutationOptions<ContactSubmitResponse, Error, ContactSubmission>,
) {
  return useMutation({ mutationFn: contactApi.submit, ...options })
}
