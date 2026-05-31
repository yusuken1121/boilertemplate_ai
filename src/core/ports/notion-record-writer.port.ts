import type { NotionPageRef } from "../domain/notion-page-ref"

export interface INotionRecordWriter<TRecord extends Record<string, unknown>> {
  create(record: TRecord): Promise<NotionPageRef>
}
