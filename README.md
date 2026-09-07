# Next.js Clean Architecture Boilerplate (AI-Native)

A Next.js App Router boilerplate for AI-assisted development (Cursor, etc.).

**Request flow:**

```
UI → React Query → /api/* → Use Case → Infrastructure
```

Detailed rules live in **Skills** — not in this file. Read the relevant skill before coding.

## Directory Layout

```
src/
├── app/                 # Routing only — pages, layouts, Route Handlers (Composition Root)
├── core/                # Shared kernel: entities, value objects, ports, generic use cases
├── infrastructure/      # Port implementations (Gemini, Notion) — the only place with SDKs
├── features/            # Vertical slices — delete a folder to remove the feature entirely
│   ├── chat/            #   Gemini chat example
│   └── contact/         #   Notion contact form example
├── components/          # Shared UI (shadcn/ui in components/ui)
├── constants/           # App config, routes, sidebar, form labels
├── hooks/ lib/ providers/
```

A feature slice owns its domain rules, use case, Zod schema, API wrapper, React Query
hook and components. `core/` and `infrastructure/` stay feature-agnostic, so the
Gemini and Notion adapters survive even if you delete both example features.

### Starting a new project from this template

1. Delete `src/features/chat/` and/or `src/features/contact/`.
2. Delete the matching `src/app/api/<feature>/route.ts` and page.
3. Remove the entry from `src/constants/sidebar.tsx` and `src/constants/path.ts`.
4. Drop the now-unused variables from `.env.example` and `src/lib/env.ts`.

Nothing outside those four places references a feature.

## Skills (Source of Truth)

All architecture rules, patterns, and workflows are defined in [`.cursor/skills/`](.cursor/skills/).

| Skill                                                                                | Use when…                                                 |
| :----------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| [architecture-overview](.cursor/skills/architecture-overview/SKILL.md)               | Understanding layers, data flow, or directory layout      |
| [architectural-rules](.cursor/skills/architectural-rules/SKILL.md)                   | Writing or reviewing code — import boundaries & standards |
| [project-setup](.cursor/skills/project-setup/SKILL.md)                               | Installing, configuring env vars, running dev/test        |
| [react-query-api-pattern](.cursor/skills/react-query-api-pattern/SKILL.md)           | Wiring UI → API Route → Use Case                          |
| [clean-architecture-extension](.cursor/skills/clean-architecture-extension/SKILL.md) | Adding a new feature or AI provider end-to-end            |
| [notion-integration](.cursor/skills/notion-integration/SKILL.md)                     | Connecting forms or records to Notion databases           |
| [sidebar-management](.cursor/skills/sidebar-management/SKILL.md)                     | Adding a route to the sidebar menu                        |

### For AI agents

Before generating code, read:

1. [architectural-rules](.cursor/skills/architectural-rules/SKILL.md)
2. [architecture-overview](.cursor/skills/architecture-overview/SKILL.md)
3. The skill matching your task (from the table above)

Cursor always-applied rules: [`.cursor/rules/code-rules.mdc`](.cursor/rules/code-rules.mdc)

## Learning Guide

Beginner-friendly walkthrough (Japanese): [docs/beginner-architecture-guide.md](docs/beginner-architecture-guide.md)

## Quick Start

```bash
pnpm install
cp .env.example .env.local   # fill in GEMINI_API_KEY, etc.
pnpm dev
```

Server secrets are validated **lazily, per variable** in [`src/lib/env.ts`](src/lib/env.ts):
you can run the Chat feature without configuring Notion, and a missing variable
fails with a named error instead of an opaque SDK crash.

Full setup details → [project-setup skill](.cursor/skills/project-setup/SKILL.md)

## Scripts

```bash
pnpm format        # Prettier — auto-fix formatting
pnpm format:check  # Prettier — check only (CI)
pnpm lint          # ESLint
pnpm lint:fix      # ESLint — auto-fix
pnpm type-check    # tsc --noEmit
pnpm test          # Vitest (run once)
pnpm test:watch    # Vitest (watch)
pnpm check         # format:check + lint + type-check + test
```

Tests run in the **node** environment and match `src/**/*.spec.ts`. Component
tests need `jsdom` + `@testing-library/react`; see
[project-setup skill](.cursor/skills/project-setup/SKILL.md).

## Tech Stack

Next.js 15 · TypeScript · React Query · Gemini · Notion · shadcn/ui · Tailwind v4 · Vitest · pnpm

Details → [project-setup skill](.cursor/skills/project-setup/SKILL.md)

## Adding a Feature (Checklist)

1. `src/features/<feature>/domain/` — entity + domain rules (errors extend `DomainError`)
2. `src/core/ports/` — a port, if the feature needs an external service
3. `src/features/<feature>/use-cases/` — orchestration
4. `src/infrastructure/<provider>/` — the adapter implementing the port
5. `src/app/api/<feature>/route.ts` — Zod validation + DI
6. `src/features/<feature>/api/` — API wrapper + React Query hook
7. `src/features/<feature>/components/` — UI

Full guide → [clean-architecture-extension skill](.cursor/skills/clean-architecture-extension/SKILL.md)
