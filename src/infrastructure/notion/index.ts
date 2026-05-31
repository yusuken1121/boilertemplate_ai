import type { INotionRecordWriter } from "../../core/ports/notion-record-writer.port";
import { ConfigurableNotionGateway } from "./configurable-notion.gateway";
import type { NotionDatabaseConfig } from "./notion-field-mapping.types";

export { ConfigurableNotionGateway } from "./configurable-notion.gateway";
export { NotionClientFactory } from "./notion-client.factory";
export { NotionPropertyBuilder } from "./notion-property.builder";
export { NotionWriteError } from "./notion-write.error";
export type {
  NotionDatabaseConfig,
  NotionFieldMapping,
  NotionFieldType,
} from "./notion-field-mapping.types";

/**
 * Factory for Dependency Injection.
 * Composition Root (Route Handler) should call this — not Use Cases.
 */
export function createNotionRecordWriter<TRecord extends Record<string, unknown>>(
  config: NotionDatabaseConfig<TRecord>,
): INotionRecordWriter<TRecord> {
  return new ConfigurableNotionGateway(config);
}
