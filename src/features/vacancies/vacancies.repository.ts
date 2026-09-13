import { and, eq, ilike, type SQL } from "drizzle-orm"
import { db } from "../../db/index.ts"
import { vacancy } from "./vacancies.schema.ts"

export type CreateVacancyRecord = {
  id: string
  organizationId: string
  title: string
  description: string
  location: string
  employmentType: string
  minQualification?: string | null
  preferredGender?: string | null
  minAge?: number | null
  maxAge?: number | null
  status: string
}

export type UpdateVacancyRecord = Partial<
  Pick<
    CreateVacancyRecord,
    | "title"
    | "description"
    | "location"
    | "employmentType"
    | "minQualification"
    | "preferredGender"
    | "minAge"
    | "maxAge"
    | "status"
  >
> & {
  reviewNotes?: string | null
}

export async function insertVacancy(data: CreateVacancyRecord) {
  const [row] = await db.insert(vacancy).values(data).returning()
  return row ?? null
}

export async function findVacancyById(id: string) {
  const [row] = await db.select().from(vacancy).where(eq(vacancy.id, id)).limit(1)
  return row ?? null
}

export async function listVacanciesByStatus(
  status: string,
  filters: { q?: string; location?: string; employmentType?: string } = {},
) {
  const conditions: SQL[] = [eq(vacancy.status, status)]
  if (filters.q) {
    conditions.push(ilike(vacancy.title, `%${filters.q}%`))
  }
  if (filters.location) {
    conditions.push(ilike(vacancy.location, `%${filters.location}%`))
  }
  if (filters.employmentType) {
    conditions.push(eq(vacancy.employmentType, filters.employmentType))
  }
  return db.select().from(vacancy).where(and(...conditions))
}

export async function listVacanciesByOrganization(organizationId: string) {
  return db.select().from(vacancy).where(eq(vacancy.organizationId, organizationId))
}

export async function updateVacancyById(id: string, data: UpdateVacancyRecord) {
  const [row] = await db.update(vacancy).set(data).where(eq(vacancy.id, id)).returning()
  return row ?? null
}

export async function deleteVacancyById(id: string) {
  const [row] = await db.delete(vacancy).where(eq(vacancy.id, id)).returning()
  return row ?? null
}
