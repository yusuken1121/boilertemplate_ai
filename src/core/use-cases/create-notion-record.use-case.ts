import type { NotionPageRef } from "../domain/notion-page-ref"
import type { INotionRecordWriter } from "../ports/notion-record-writer.port"

export class CreateNotionRecordUseCase<
  TRecord extends Record<string, unknown>,
> {
  constructor(private readonly writer: INotionRecordWriter<TRecord>) {}

  async execute(record: TRecord): Promise<NotionPageRef> {
    return this.writer.create(record)
  }
}
