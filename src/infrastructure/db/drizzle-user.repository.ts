import { eq } from "drizzle-orm"
import type {
  CreateUserInput,
  IUserRepository,
} from "@/core/ports/user-repository.port"
import type { User, UserWithCredentials } from "@/core/domain/user.entity"
import { getDb } from "./client"
import { users, type UserRow } from "./schema"

/** Rows are a storage detail; the rest of the app only sees the entity. */
function toEntity(row: UserRow): UserWithCredentials {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
  }
}

function toPublic(row: UserRow): User {
  const { passwordHash: _passwordHash, ...rest } = toEntity(row)
  return rest
}

export class DrizzleUserRepository implements IUserRepository {
  private readonly db = getDb()

  async findByEmail(email: string): Promise<UserWithCredentials | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    return row ? toEntity(row) : null
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    return row ? toPublic(row) : null
  }

  async create(input: CreateUserInput): Promise<User> {
    const [row] = await this.db
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash: input.passwordHash,
        role: input.role ?? "member",
      })
      .returning()

    if (!row) {
      throw new Error("Insert returned no row")
    }

    return toPublic(row)
  }
}

/**
 * Factory for Dependency Injection.
 * Call from Route Handlers (Composition Root) only.
 */
export function createUserRepository(): IUserRepository {
  return new DrizzleUserRepository()
}
