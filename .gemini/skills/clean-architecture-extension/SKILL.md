---
name: clean-architecture-extension
description: "Extend the Clean Architecture template by adding new AI gateways or generating end-to-end features (Entity, Port, Use Case, Adapter, Server Action, and UI Component)."
---

# Clean Architecture Extension Skill

This skill outlines how to scale, customize, and extend the chat application following strict **Clean Architecture** boundaries and SOLID coding standards.

---

## 📂 Architecture & Directory Structure

To extend this application, you must respect the directory boundaries:

```text
src/
├── core/                           # Pure Domain & Application logic (No external I/O)
│   ├── domain/                     # Entities (Pure TypeScript, no React/Next/SDKs)
│   ├── ports/                      # Interfaces (Ports defining the contracts)
│   └── use-cases/                  # Use Cases (Orchestrates Business Logic)
│
├── infrastructure/                  # Concrete Adapters (SDKs, database clients, API wrappers)
│   ├── gemini/                     # Gemini Gateway
│   └── notion/                     # Notion Gateway
│
└── app/                            # UI Components and Controllers
    ├── _actions/                   # Server Actions (Composition Root / dependency injection)
    └── _components/                # React / Shadcn UI components
```

---

## 🤖 1. Adding a New AI Provider (AI Gateway)

Adding a new AI provider (like OpenAI or Anthropic Claude) requires zero changes to the Core business logic or use cases.

### Step 1: Implement the Port Interface
Create a new folder under `src/infrastructure/` (e.g., `src/infrastructure/openai/`) and write an adapter that implements `IAIGateway` (defined in `src/core/ports/ai-gateway.port.ts`).

```typescript
import type { IAIGateway } from "@/core/ports/ai-gateway.port";
import type { Message } from "@/core/domain/message.entity";

export class OpenAIGateway implements IAIGateway {
  async generate(messages: Message[], options?: any): Promise<string> {
    // Concrete call to OpenAI SDK
  }
  
  async generateStream(messages: Message[], options?: any): Promise<ReadableStream<string>> {
    // Stream response call to OpenAI SDK
  }
}
```

### Step 2: Create a Factory Export
Expose a clean instantiator function in `src/infrastructure/openai/index.ts`:

```typescript
export function createOpenAIGateway(): IAIGateway {
  return new OpenAIGateway();
}
```

### Step 3: Swap Providers in the Composition Root
Update the Server Action in `src/app/_actions/chat.ts` to instantiate the new gateway. The rest of the pipeline (use cases, UI layers) continues to work without edits.

```diff
-const aiGateway = createGeminiGateway();
+const aiGateway = createOpenAIGateway();
 const sendMessageUseCase = new SendMessageUseCase(aiGateway);
```

---

## 🚀 2. Generating a Complete New Feature

When creating a new feature (e.g., "User Feedback Form"), use this step-by-step master checklist:

### Step 1: Create the Domain Entity
Define the pure data shape inside `src/core/domain/` using TypeScript. Avoid React, Next.js, or database imports.

```typescript
// src/core/domain/feedback.entity.ts
export interface Feedback {
  id: string;
  rating: number;
  comments: string;
  createdAt: Date;
}
```

### Step 2: Define the Port (Interface)
Define contracts/interfaces for any external actions (writing to a DB, sending email) inside `src/core/ports/`.

```typescript
// src/core/ports/feedback-repository.port.ts
import { Feedback } from "../domain/feedback.entity";

export interface IFeedbackRepository {
  save(feedback: Feedback): Promise<void>;
}
```

### Step 3: Write the Use Case
Implement the core business logic or orchestration inside `src/core/use-cases/`. Depend purely on the interface port.

```typescript
// src/core/use-cases/submit-feedback.use-case.ts
import { Feedback } from "../domain/feedback.entity";
import { IFeedbackRepository } from "../ports/feedback-repository.port";

export class SubmitFeedbackUseCase {
  constructor(private readonly repository: IFeedbackRepository) {}

  async execute(input: Omit<Feedback, "id" | "createdAt">): Promise<Feedback> {
    const feedback: Feedback = {
      id: Math.random().toString(), // Or uuid v4
      createdAt: new Date(),
      ...input,
    };
    await this.repository.save(feedback);
    return feedback;
  }
}
```

### Step 4: Implement the Infrastructure Adapter
Write the concrete implementation of your Port inside `src/infrastructure/` (e.g., writing to Notion or a database).

```typescript
// src/infrastructure/database/firestore-feedback.repository.ts
import { IFeedbackRepository } from "@/core/ports/feedback-repository.port";
import { Feedback } from "@/core/domain/feedback.entity";

export class FirestoreFeedbackRepository implements IFeedbackRepository {
  async save(feedback: Feedback): Promise<void> {
    // Write code to write feedback into Firestore database
  }
}
```

### Step 5: Compose and Validate inside the Server Action
Create a Server Action in `src/app/_actions/` to act as the Composition Root. Validate client input using **Zod** first.

```typescript
// src/app/_actions/feedback.ts
"use server";

import { z } from "zod";
import { FirestoreFeedbackRepository } from "@/infrastructure/database/firestore-feedback.repository";
import { SubmitFeedbackUseCase } from "@/core/use-cases/submit-feedback.use-case";

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comments: z.string().min(5),
});

export async function submitFeedbackAction(formData: any) {
  const validated = feedbackSchema.parse(formData);
  
  // Dependency Injection (Composition Root)
  const repo = new FirestoreFeedbackRepository();
  const useCase = new SubmitFeedbackUseCase(repo);
  
  return await useCase.execute(validated);
}
```

### Step 6: Build the UI Component
Construct user interface components under `src/app/_components/` using **shadcn/ui** libraries and tailwind classes. Retrieve actions or state using normal React handles.
