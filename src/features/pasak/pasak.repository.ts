import { eq } from "drizzle-orm"
import { organization } from "../../auth/schema.ts"
import { db } from "../../db/index.ts"

export async function listCompanies(status?: string) {
  if (status) {
    return db.select().from(organization).where(eq(organization.status, status))
  }
  return db.select().from(organization)
}

export async function findCompanyById(id: string) {
  const [row] = await db.select().from(organization).where(eq(organization.id, id)).limit(1)
  return row ?? null
}

export async function updateCompany(
  id: string,
  data: { status?: string; reviewNotes?: string | null },
) {
  const [row] = await db
    .update(organization)
    .set(data)
    .where(eq(organization.id, id))
    .returning()
  return row ?? null
}

export async function updateCompanyStatus(id: string, status: string) {
  return updateCompany(id, { status })
}
