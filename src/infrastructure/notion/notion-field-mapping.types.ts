export type NotionFieldType =
  | "title"
  | "rich_text"
  | "number"
  | "date"
  | "select"
  | "files"
  | "checkbox"
  | "url";

export type NotionFieldMapping<TRecord extends Record<string, unknown>> = {
  /** Omit when using transform-only fields (e.g. derived title). */
  recordKey?: keyof TRecord & string;
  propertyName: string;
  type: NotionFieldType;
  transform?: (value: unknown, record: TRecord) => unknown;
};

export type NotionDatabaseConfig<TRecord extends Record<string, unknown>> = {
  databaseId: string;
  fields: Array<NotionFieldMapping<TRecord>>;
};
