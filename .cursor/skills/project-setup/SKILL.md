---
name: project-setup
description: >-
  Tech stack, installation, environment variables, and dev commands for this
  boilerplate. Use when setting up the project locally or configuring env vars.
---

# Project Setup

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Data Fetching**: TanStack React Query + Axios
- **AI**: Google Generative AI SDK (Gemini)
- **External DB**: Notion API
- **UI**: shadcn/ui + Tailwind CSS v4
- **Testing**: Vitest
- **Lint / Format**: ESLint + Prettier
- **Package Manager**: pnpm

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment setup

```bash
cp .env.example .env.local
```

Fill in the required values (see table below).

### 3. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Run tests

```bash
pnpm test        # run once
pnpm test:watch  # watch mode
```

Vitest runs in the **node** environment and picks up `src/**/*.spec.ts`, colocated
with the code under test. Core, Use Cases, Infrastructure and Zod schemas need no DOM.

To test React components as well, install the missing dependencies and split the
Vitest config into projects:

```bash
pnpm add -D jsdom @testing-library/react @testing-library/jest-dom
```

```ts
// vitest.config.ts
test: {
  projects: [
    { test: { name: "node", environment: "node", include: ["src/**/*.spec.ts"] } },
    { test: { name: "dom", environment: "jsdom", include: ["src/**/*.spec.tsx"] } },
  ],
}
```

### 5. Format & lint

```bash
pnpm format        # Prettier — auto-fix
pnpm format:check  # Prettier — check only (CI)
pnpm lint          # ESLint
pnpm lint:fix      # ESLint — auto-fix
pnpm type-check    # tsc --noEmit
pnpm check         # format:check + lint + type-check + test
```

VS Code / Cursor: `.vscode/settings.json` enables format-on-save with Prettier and ESLint fix.

## Environment Variables

| Variable                      | Required      | Description                               |
| :---------------------------- | :------------ | :---------------------------------------- |
| `GEMINI_API_KEY`              | Yes (Chat)    | Google AI API key                         |
| `NOTION_TOKEN`                | Yes (Contact) | Notion integration token                  |
| `NOTION_CONTACT_DATABASE_ID`  | Yes (Contact) | Target Notion database ID                 |
| `NEXT_PUBLIC_APP_NAME`        | No            | Shown in the sidebar, tab title, Settings |
| `NEXT_PUBLIC_APP_DESCRIPTION` | No            | Meta description                          |
| `NEXT_PUBLIC_APP_URL`         | No            | `metadataBase` for absolute URLs          |
| `NEXT_PUBLIC_APP_VERSION`     | No            | Shown on the Settings page                |
| `NEXT_PUBLIC_API_URL`         | No            | API base URL (defaults to same origin)    |
| `NEXT_PUBLIC_USE_MOCK`        | No            | Set `"true"` to use mock API              |
| `NEXT_PUBLIC_MOCK_API_URL`    | No            | Mock API base URL                         |

See `.env.example` for the template.

### How secrets are read

Server secrets are declared in `src/lib/env.ts` and read through `serverEnv(key)`,
which validates **lazily, one key at a time**: you can run Chat without configuring
Notion, and a missing variable fails with `MissingEnvVarError` naming the variable
instead of an opaque SDK crash. Never read `process.env.<SECRET>` anywhere else.

`NEXT_PUBLIC_*` values are inlined at build time and belong in
`src/constants/app-config.ts` (public metadata) or `src/lib/api/api-client.ts` (base URL).

## Related Skills

- [architecture-overview](../architecture-overview/SKILL.md)
- [architectural-rules](../architectural-rules/SKILL.md)
