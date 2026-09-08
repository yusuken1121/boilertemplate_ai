import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core"

/**
 * Database schema — the single source of truth for migrations.
 *
 * `drizzle-kit generate` reads this file (see drizzle.config.ts). Domain code
 * never imports it: repositories map rows onto the entities in
 * `src/core/domain/`, so a column rename cannot ripple into business logic.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["admin", "member"] })
      .notNull()
      .default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("users_email_idx").on(table.email)],
)

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert
