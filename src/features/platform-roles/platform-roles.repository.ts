import { asc, eq } from "drizzle-orm"
import { db } from "../../db/index.ts"
import { platformRole } from "./platform-roles.schema.ts"

export async function listRoles() {
  return db.select().from(platformRole).orderBy(asc(platformRole.name))
}

export async function findRoleById(id: string) {
  const [row] = await db
    .select()
    .from(platformRole)
    .where(eq(platformRole.id, id))
    .limit(1)
  return row ?? null
}

export async function findRoleByName(name: string) {
  const [row] = await db
    .select()
    .from(platformRole)
    .where(eq(platformRole.name, name))
    .limit(1)
  return row ?? null
}

export async function insertRole(data: {
  id: string
  name: string
  label: string
  permissions: Record<string, string[]>
}) {
  const [row] = await db.insert(platformRole).values(data).returning()
  return row ?? null
}

export async function updateRole(
  id: string,
  data: { label?: string; permissions?: Record<string, string[]> },
) {
  const [row] = await db
    .update(platformRole)
    .set(data)
    .where(eq(platformRole.id, id))
    .returning()
  return row ?? null
}

export async function deleteRole(id: string) {
  const [row] = await db
    .delete(platformRole)
    .where(eq(platformRole.id, id))
    .returning()
  return row ?? null
}
