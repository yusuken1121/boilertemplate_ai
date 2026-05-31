---
name: notion-integration
description: >-
  Configure, map, extend, and unit-test Notion database writes via the
  configurable Notion gateway. Use when adding Notion as a data store or
  connecting a form to a Notion database.
---

# Notion Integration

The Notion module is an **Infrastructure adapter** implementing a Core Port.

| Role | Location |
| :--- | :------- |
| Port | `INotionRecordWriter<TRecord>` — `src/core/ports/notion-record-writer.port.ts` |
| Adapter | `ConfigurableNotionGateway<TRecord>` — `src/infrastructure/notion/configurable-notion.gateway.ts` |
| Factory | `createNotionRecordWriter(config)` — `src/infrastructure/notion/index.ts` |
| Use Case | `CreateNotionRecordUseCase` — `src/core/use-cases/create-notion-record.use-case.ts` |
| Route Handler | `src/app/api/notion/route.ts` |

## Setting Up a New Database

### 1. Define the record type

Prefer `src/core/domain/` for types shared with the client.

```typescript
// src/core/domain/contact-submission.entity.ts
export interface ContactSubmission extends Record<string, unknown> {
  name: string;
  email: string;
  message: string;
}
```

### 2. Define field mapping

`src/infrastructure/notion/contact.config.ts`:

```typescript
import type { NotionDatabaseConfig } from "./notion-field-mapping.types";
import type { ContactSubmission } from "@/core/domain/contact-submission.entity";

export const contactNotionConfig: NotionDatabaseConfig<ContactSubmission> = {
  databaseId: process.env.NOTION_CONTACT_DATABASE_ID || "",
  fields: [
    { recordKey: "name", propertyName: "Name", type: "title" },
    { recordKey: "email", propertyName: "Email", type: "url" },
    {
      recordKey: "message",
      propertyName: "Description",
      type: "rich_text",
      transform: (value) => `[Web Contact] ${String(value)}`,
    },
  ],
};
```

### 3. Supported field types

`NotionPropertyBuilder` supports: `title`, `rich_text`, `number`, `date`, `select`, `checkbox`, `url`, `files` (HTTPS only).

### 4. Wire through Route Handler + React Query

Follow [react-query-api-pattern](../react-query-api-pattern/SKILL.md). Existing implementation:

- Route: `src/app/api/notion/route.ts`
- API wrapper: `src/lib/api/notion.ts`
- Hook: `useCreateNotionRecord` in `src/lib/api/queries/useNotion.ts`

## Unit Testing

Use **Vitest**. Run with `pnpm test`.

### Property Builder (no network)

```typescript
import { NotionPropertyBuilder } from "./notion-property.builder";

describe("NotionPropertyBuilder", () => {
  it("maps title fields", () => {
    const result = NotionPropertyBuilder.build(
      { title: "Hello" },
      [{ recordKey: "title", propertyName: "Name", type: "title" }],
    );
    expect(result).toEqual({
      Name: { title: [{ text: { content: "Hello" } }] },
    });
  });
});
```

### Gateway with mock client

```typescript
import { vi } from "vitest";
import { ConfigurableNotionGateway } from "./configurable-notion.gateway";

const mockCreate = vi.fn();
const mockClient = { pages: { create: mockCreate } } as unknown as Client;
const gateway = new ConfigurableNotionGateway(config, mockClient);
```

## Environment Variables

| Variable | Description |
| :------- | :---------- |
| `NOTION_TOKEN` | Integration token |
| `NOTION_CONTACT_DATABASE_ID` | Target database ID |

See [project-setup](../project-setup/SKILL.md).

## Related Skills

- [react-query-api-pattern](../react-query-api-pattern/SKILL.md)
- [clean-architecture-extension](../clean-architecture-extension/SKILL.md)
