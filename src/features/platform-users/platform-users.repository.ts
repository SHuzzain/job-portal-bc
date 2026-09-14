import { desc, eq } from "drizzle-orm"
import { db } from "../../db/index.ts"
import { user } from "../../db/schema.ts"

const columns = {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  accountStatus: user.accountStatus,
  hasTvetCapability: user.hasTvetCapability,
  banned: user.banned,
  createdAt: user.createdAt,
}

export async function listUsers() {
  return db.select(columns).from(user).orderBy(desc(user.createdAt))
}

export async function findUserById(id: string) {
  const [row] = await db.select(columns).from(user).where(eq(user.id, id)).limit(1)
  return row ?? null
}

export async function findUserByEmail(email: string) {
  const [row] = await db.select(columns).from(user).where(eq(user.email, email)).limit(1)
  return row ?? null
}

export async function updateUserRole(id: string, role: string) {
  const [row] = await db
    .update(user)
    .set({ role })
    .where(eq(user.id, id))
    .returning(columns)
  return row ?? null
}

export async function markVerifiedWithRole(email: string, role: string) {
  const [row] = await db
    .update(user)
    .set({ role, emailVerified: true })
    .where(eq(user.email, email))
    .returning(columns)
  return row ?? null
}

export async function setAccountStatus(id: string, accountStatus: string) {
  const [row] = await db
    .update(user)
    .set({ accountStatus })
    .where(eq(user.id, id))
    .returning(columns)
  return row ?? null
}
