import { apiClient } from "./apiClient"
import type { ContactSubmission } from "@/infrastructure/notion/contact.config"

export interface NotionWriteResponse {
  success: boolean
  page: {
    id: string
  }
}

export const notionApi = {
  /**
   * Notionデータベースにコンタクトレコードを作成
   */
  createContactRecord: async (
    data: ContactSubmission,
  ): Promise<NotionWriteResponse> => {
    return apiClient.post("/api/notion", data)
  },
}
