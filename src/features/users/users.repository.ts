import { eq } from "drizzle-orm"
import { db } from "../../db/index.ts"
import { user } from "./users.schema.ts"

export type UpdateUserRecord = {
  name?: string
  image?: string | null
  phoneNumber?: string | null
  hasTvetCapability?: boolean
  activeWorkspace?: string
}

export async function listEmployers() {
  return db.select().from(user).where(eq(user.role, "employer"))
}

export async function findUserById(id: string) {
  const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1)
  return row ?? null
}

export async function updateUserById(id: string, data: UpdateUserRecord) {
  const [row] = await db.update(user).set(data).where(eq(user.id, id)).returning()
  return row ?? null
}
