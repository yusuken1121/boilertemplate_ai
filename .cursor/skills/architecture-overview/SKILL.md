---
name: architecture-overview
description: >-
  Clean Architecture layer map, data flow, and directory structure for this
  project. Use when onboarding, exploring the codebase, or deciding where new
  code belongs.
---

# Architecture Overview

This project uses **Clean Architecture** with a fixed request flow:

```
UI → React Query → /api/* → Use Case → Infrastructure
```

Server Actions are **not used**. All client-to-server calls go through Route Handlers.

## Two axes: layers and slices

Layers say _what kind_ of code something is. Slices say _which feature_ it belongs to.

- `src/core` and `src/infrastructure` are **feature-agnostic**: the shared kernel and
  the reusable adapters. They survive when a feature is deleted.
- `src/features/<feature>` is a **vertical slice**: domain rules, use case, Zod schema,
  API wrapper, React Query hook, components. Deleting the folder removes the feature.

A slice may import from `core` (inward). `core` and `infrastructure` must **never**
import from `features`.

## Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│  UI Layer                                                    │
│  src/features/<f>/components/  +  src/components/ui/         │
└──────────────────────────────┬──────────────────────────────┘
                               │ React Query hooks
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Client Data Layer                                           │
│  src/features/<f>/api/  →  src/lib/api/api-client.ts         │
└──────────────────────────────┬──────────────────────────────┘
                               │ POST /api/*
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Composition Root (Controller)                               │
│  src/app/api/**/route.ts  — Zod validation + DI              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Application Layer                                           │
│  src/features/<f>/use-cases/  ·  src/core/use-cases/         │
└──────────────────────────────┬──────────────────────────────┘
                               │ depends on Ports (interfaces)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure Layer                                        │
│  src/infrastructure/  — Gemini, Notion, etc.                 │
└─────────────────────────────────────────────────────────────┘
```

## Example: Chat

```
ChatInterface                    [src/features/chat/components/]
  → useChatStream()              [src/features/chat/hooks/use-chat-stream.ts]
  → useSendMessageStream()       [src/features/chat/api/use-chat.ts]
  → POST /api/chat               [src/app/api/chat/route.ts]
  → SendMessageUseCase           [src/features/chat/use-cases/]
  → GeminiGateway (IAIGateway)   [src/infrastructure/gemini/]
```

## Context Map

| Layer                | Path                        | Responsibility                           | May Import                      |
| :------------------- | :-------------------------- | :--------------------------------------- | :------------------------------ |
| **Domain**           | `src/core/domain`           | Entities, value objects, `DomainError`.  | Nothing                         |
| **Ports**            | `src/core/ports`            | Interfaces for external services.        | Domain                          |
| **Shared Use Cases** | `src/core/use-cases`        | Generic, feature-agnostic orchestration. | Domain, Ports                   |
| **Infrastructure**   | `src/infrastructure`        | Port implementations (SDKs, APIs).       | Core, `src/lib/env.ts`          |
| **Feature slice**    | `src/features/<f>`          | One feature, end to end.                 | Core, Infrastructure types, lib |
| **Composition Root** | `src/app/api/**/route.ts`   | Zod validation, DI, HTTP entry points.   | Everything                      |
| **UI**               | `src/app`, `src/components` | Pages, layout, shadcn/ui.                | Features, lib, constants        |

## Project Structure

```text
src/
├── app/                          # Routing only
│   ├── api/                      # Route Handlers (Composition Root)
│   │   ├── chat/route.ts
│   │   └── contact/route.ts
│   ├── page.tsx  contact/  settings/
│   ├── layout.tsx  error.tsx  loading.tsx  not-found.tsx
│
├── core/                         # Pure TypeScript — no React, Next.js, or SDKs
│   ├── domain/                   # message.entity.ts, ai-generate-options.vo.ts,
│   │                             # notion-page-ref.vo.ts, domain.error.ts
│   ├── ports/                    # IAIGateway, INotionRecordWriter
│   └── use-cases/                # CreateNotionRecordUseCase (generic)
│
├── infrastructure/               # External service adapters
│   ├── gemini/                   # IAIGateway implementation
│   └── notion/                   # INotionRecordWriter implementation (generic)
│
├── features/                     # Vertical slices — delete a folder to remove one
│   ├── chat/
│   │   ├── chat.config.ts        # model id + display label (single source)
│   │   ├── chat.schema.ts        # Zod request schema + client types
│   │   ├── domain/               # message.validation.ts
│   │   ├── use-cases/            # send-message.use-case.ts
│   │   ├── api/                  # chat.api.ts, use-chat.ts
│   │   ├── hooks/                # use-chat-stream.ts
│   │   └── components/
│   └── contact/
│       ├── contact.schema.ts
│       ├── domain/               # contact-submission.entity.ts
│       ├── notion/               # contact-database.config.ts (field mapping)
│       ├── api/                  # contact.api.ts, use-contact.ts
│       └── components/
│
├── components/                   # Shared UI
│   ├── ui/                       # shadcn/ui primitives
│   ├── app-sidebar.tsx  global-header.tsx  theme-provider.tsx
│
├── lib/
│   ├── api/api-client.ts         # apiGet / apiPost / apiPostStream + ApiError
│   ├── env.ts                    # lazy, validated server env access
│   ├── route-error.ts            # thrown value → HTTP response
│   ├── navigation.ts  utils.ts
│   └── zod/zod-config.ts         # global Japanese Zod error map
│
├── constants/                    # app-config.ts, path.ts, sidebar.tsx, labels.ts
├── hooks/                        # use-mobile.ts
└── providers/                    # ReactQueryProvider
```

## Related Skills

- [architectural-rules](../architectural-rules/SKILL.md) — import boundaries and coding standards
- [react-query-api-pattern](../react-query-api-pattern/SKILL.md) — client data layer pattern
- [clean-architecture-extension](../clean-architecture-extension/SKILL.md) — adding new features
