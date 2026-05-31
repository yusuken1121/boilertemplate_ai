import type { NotionDatabaseConfig } from "./notion-field-mapping.types"

export interface ContactSubmission extends Record<string, unknown> {
  name: string
  email: string
  message: string
}

export const contactNotionConfig: NotionDatabaseConfig<ContactSubmission> = {
  databaseId: process.env.NOTION_CONTACT_DATABASE_ID || "",
  fields: [
    { recordKey: "name", propertyName: "Name", type: "title" },
    { recordKey: "email", propertyName: "Email", type: "url" },
    { recordKey: "message", propertyName: "Message", type: "rich_text" },
  ],
}
