import { and, eq } from "drizzle-orm"
import { db } from "../../db/index.ts"
import { resume } from "./resumes.schema.ts"

export async function listByUserId(userId: string) {
  return db.select().from(resume).where(eq(resume.userId, userId))
}

export async function findByIdForUser(id: string, userId: string) {
  const [row] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, id), eq(resume.userId, userId)))
    .limit(1)
  return row ?? null
}

export async function insertResume(data: { id: string; userId: string; title: string; fileUrl: string }) {
  const [row] = await db.insert(resume).values(data).returning()
  return row ?? null
}

export async function deleteByIdForUser(id: string, userId: string) {
  const [row] = await db
    .delete(resume)
    .where(and(eq(resume.id, id), eq(resume.userId, userId)))
    .returning()
  return row ?? null
}
