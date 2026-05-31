---
name: notion-integration
description: "Configure, map, extend, and unit-test new databases with the configurable Notion gateway inside the boiler-template Clean Architecture workspace."
---

# Notion Integration Skill

This skill provides step-by-step instructions on how to use, extend, configure, and unit-test Notion Database integrations inside the Clean Architecture boilerplate.

## 🏗️ Architecture & Component Boundaries

The Notion module lives strictly in the **Infrastructure Layer** (`src/infrastructure/notion/`) and acts as a concrete adapter implementing port interfaces defined in the **Core Layer** (`src/core/ports/`).

*   **Port**: `INotionRecordWriter<TRecord>` (defined in `src/core/ports/notion-record-writer.port.ts`).
*   **Adapter**: `ConfigurableNotionGateway<TRecord>` (defined in `src/infrastructure/notion/configurable-notion.gateway.ts`).
*   **Composition Root / Factory**: `createNotionRecordWriter<TRecord>(config)` (defined in `src/infrastructure/notion/index.ts`).

---

## 🚀 Setting Up a New Database Connection

To save any record or form submission to a new Notion database:

### 1. Define the Source Record Type
Create a clean TypeScript interface representing the source data record.

```typescript
export interface ContactSubmission extends Record<string, unknown> {
  name: string;
  email: string;
  message: string;
  website?: string;
}
```

### 2. Define the Database Field Mapping
Configure the `NotionDatabaseConfig` structure. Fields map source record keys to Notion property names and types.

```typescript
import type { NotionDatabaseConfig } from "@/infrastructure/notion";

export const contactNotionConfig: NotionDatabaseConfig<ContactSubmission> = {
  databaseId: process.env.NOTION_CONTACT_DATABASE_ID || "",
  fields: [
    // Direct primitive mappings
    { recordKey: "name", propertyName: "Name", type: "title" },
    { recordKey: "email", propertyName: "Email Address", type: "url" },
    
    // Mappings using transform function
    {
      recordKey: "message",
      propertyName: "Description",
      type: "rich_text",
      transform: (value) => `[Web Contact] ${String(value)}`,
    },
  ],
};
```

### 3. Supported Notion Field Types
The `NotionPropertyBuilder` supports the following types:
*   `"title"`: Title property of the page.
*   `"rich_text"`: Paragraph/text properties.
*   `"number"`: Numerical properties (automatically cast to JavaScript numbers).
*   `"date"`: Mapped to a single start date string.
*   `"select"`: Mapped to a single option label.
*   `"checkbox"`: Boolean values (true/false).
*   `"url"`: Web URL links.
*   `"files"`: Supports a single HTTPS URL string or an array of HTTPS URL strings. Note: Only **HTTPS** links are accepted; HTTP schemas will trigger a builder validation error.

### 4. Dependency Injection in the Composition Root
Call the factory from Server Actions (`src/app/_actions/`) or Route Handlers, injecting it into the Use Case. Never instantiate the gateway directly in your Use Cases.

```typescript
import { createNotionRecordWriter } from "@/infrastructure/notion";
import { contactNotionConfig } from "@/infrastructure/notion/configs/contact.config";
import { SubmitContactUseCase } from "@/core/use-cases/submit-contact.use-case";

export async function submitContactAction(data: ContactSubmissionInput) {
  // Inject adapter
  const notionWriter = createNotionRecordWriter(contactNotionConfig);
  const useCase = new SubmitContactUseCase(notionWriter);
  
  return await useCase.execute(data);
}
```

---

## 🧪 Verifying & Unit Testing Notion Adapters

Unit tests are written using **Vitest** to ensure instant and lightweight validation.

### 1. Testing the Property Builder
Test payload mapping and synchronous validation logic (e.g. HTTPS requirement for files) in isolation without network calls.

```typescript
import { NotionPropertyBuilder } from "./notion-property.builder";

describe("NotionPropertyBuilder", () => {
  it("should map text fields correctly", () => {
    const result = NotionPropertyBuilder.build(
      { title: "Hello" },
      [{ recordKey: "title", propertyName: "Name", type: "title" }]
    );
    expect(result).toEqual({
      Name: { title: [{ text: { content: "Hello" } }] }
    });
  });
});
```

### 2. Testing the Gateway with Mock Clients
Inject a mocked Notion SDK client into the gateway constructor to check API payload mapping and exception catching.

```typescript
import { vi, expect } from "vitest";
import { ConfigurableNotionGateway } from "./configurable-notion.gateway";
import type { Client } from "@notionhq/client";

const mockCreate = vi.fn();
const mockClient = { pages: { create: mockCreate } } as unknown as Client;

const gateway = new ConfigurableNotionGateway(config, mockClient);
```

### 3. Run Command
Run the test runner to verify coverage:
```bash
pnpm test
```

---

## ⚡ Client-Side Optimization with React Query & Route Handlers

To enable safe, non-blocking inserts into Notion databases directly from React Client Components (without exposing secret backend keys like `NOTION_TOKEN`), wrap your gateway using standard Next.js App Router Route Handlers and TanStack Query `useMutation` custom hooks.

### 1. API Route Handler (Composition Root)
Expose a secure API Route handler at `src/app/api/notion/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createNotionRecordWriter } from "@/infrastructure/notion";
import { contactNotionConfig, ContactSubmission } from "@/infrastructure/notion/contact.config";
import { CreateNotionRecordUseCase } from "@/core/use-cases/create-notion-record.use-case";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Inject and execute Use Case
    const writer = createNotionRecordWriter<ContactSubmission>(contactNotionConfig);
    const useCase = new CreateNotionRecordUseCase<ContactSubmission>(writer);
    const pageRef = await useCase.execute(body);

    return NextResponse.json({ success: true, page: pageRef });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

### 2. Client API Client Wrapper
Declare the endpoint mapping in `src/lib/api/notion.ts` using the customized `apiClient`:
```typescript
import { apiClient } from "./apiClient";
import type { ContactSubmission } from "@/infrastructure/notion/contact.config";

export const notionApi = {
  createContactRecord: async (data: ContactSubmission) => {
    return apiClient.post("/api/notion", data);
  },
};
```

### 3. React Query Custom Mutation Hook
Create a clean custom mutation hook in `src/lib/api/queries/useNotion.ts`:
```typescript
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { notionApi } from "../notion";
import type { ContactSubmission } from "@/infrastructure/notion/contact.config";

export const useCreateNotionRecord = (options?: UseMutationOptions<any, Error, ContactSubmission>) => {
  return useMutation({
    mutationFn: notionApi.createContactRecord,
    ...options,
  });
};
```

### 4. Consumption in Front-End Form
Instantiate the mutation in your Client Component. Use mutation states to manage active loading UI cleanly:
```tsx
"use client";

import { useCreateNotionRecord } from "@/lib/api/queries/useNotion";

export function ContactForm() {
  const { mutate, isPending, isError, isSuccess } = useCreateNotionRecord();

  const onSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <form onSubmit={onSubmit}>
      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Send to Notion"}
      </button>
      {isSuccess && <p>Saved successfully to Notion database!</p>}
      {isError && <p>Error saving to database.</p>}
    </form>
  );
}
```
