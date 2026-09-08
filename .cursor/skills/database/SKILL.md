---
name: database
description: >-
  Drizzle ORM + Postgres in this project — schema, migrations, the Repository
  port pattern, and local setup. Use when adding a table, writing a query, or
  wiring persistence into a use case.
---

# Database

Drizzle ORM over Postgres. The adapter is infrastructure; use cases only ever
see a **port**.

| Role             | Location                                           |
| :--------------- | :------------------------------------------------- |
| Schema           | `src/infrastructure/db/schema.ts`                  |
| Connection       | `src/infrastructure/db/client.ts`                  |
| Repository port  | `src/core/ports/user-repository.port.ts`           |
| Repository       | `src/infrastructure/db/drizzle-user.repository.ts` |
| Migration config | `drizzle.config.ts`                                |
| Generated SQL    | `drizzle/`                                         |
| Local Postgres   | `docker-compose.yml`                               |
| First account    | `scripts/seed.ts`                                  |

## Local setup

```bash
docker compose up -d     # Postgres on :5432, matching .env.example
pnpm db:generate         # schema.ts -> drizzle/*.sql
pnpm db:migrate          # apply
pnpm db:seed             # create the first account
pnpm db:studio           # browse the data
```

## Rows are not entities

A repository maps rows onto the entities in `src/core/domain/`. Domain code
never imports `schema.ts`, so renaming a column cannot ripple into business
logic — the mapping function absorbs it.

```typescript
function toEntity(row: UserRow): UserWithCredentials { ... }
```

Note the two mappers in `drizzle-user.repository.ts`: `findByEmail` returns the
password hash (the Credentials provider needs it), `findById` does not. **The
secret leaves the repository only where verifying it is the point.**

## Adding a table

1. Add it to `src/infrastructure/db/schema.ts`.
2. `pnpm db:generate` → review the SQL in `drizzle/` → commit it.
3. Define the entity in `src/core/domain/` (shared) or `src/features/<f>/domain/`.
4. Define the port — `src/core/ports/` if shared, the feature otherwise.
5. Implement the repository in `src/infrastructure/db/`, with a `create…` factory.
6. Inject it in the Route Handler.

Never call `getDb()` from a use case or a component. Only a repository touches
Drizzle, and only a Route Handler constructs a repository.

## Connection handling

`getDb()` creates the client on first use, not at import time: a project that
has not set up a database must still build and run the features that do not
touch it. `DATABASE_POOL_MAX` (default 5) keeps warm serverless instances from
exhausting Postgres connections.

## Migrations outside the app

`drizzle.config.ts` calls `process.loadEnvFile(".env.local")` itself —
drizzle-kit runs outside the Next.js process, so nothing has loaded it. An
exported `DATABASE_URL` still wins, which is how CI and production supply it.

## Swapping Postgres out

Write one new class implementing `IUserRepository`, change the factory the Route
Handler calls. Nothing else moves — that is what the port is for.

## Related Skills

- [authentication](../authentication/SKILL.md) — the first consumer of the user repository
- [clean-architecture-extension](../clean-architecture-extension/SKILL.md)
