import { apiClient } from "./apiClient"
import type { ContactSubmission } from "@/core/domain/contact-submission.entity"

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
