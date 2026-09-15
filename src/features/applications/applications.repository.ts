import { and, eq, inArray, lt } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { vacancy } from "../vacancies/vacancies.schema.ts";
import { application } from "./applications.schema.ts";

export async function insertApplication(data: {
  id: string;
  userId: string;
  vacancyId: string;
  resumeId: string;
  status: string;
}) {
  const [row] = await db.insert(application).values(data).returning();
  return row ?? null;
}

export async function findByUserAndVacancy(userId: string, vacancyId: string) {
  const [row] = await db
    .select()
    .from(application)
    .where(
      and(eq(application.userId, userId), eq(application.vacancyId, vacancyId))
    )
    .limit(1);
  return row ?? null;
}

export async function listByUserId(userId: string) {
  return db.select().from(application).where(eq(application.userId, userId));
}

export async function listByVacancyId(vacancyId: string) {
  return db
    .select()
    .from(application)
    .where(eq(application.vacancyId, vacancyId));
}

export async function findById(id: string) {
  const [row] = await db
    .select()
    .from(application)
    .where(eq(application.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateStatusById(id: string, status: string) {
  const [row] = await db
    .update(application)
    .set({ status })
    .where(eq(application.id, id))
    .returning();
  return row ?? null;
}

export async function updateStatusIfCurrent(
  id: string,
  currentStatuses: string[],
  status: string
) {
  const [row] = await db
    .update(application)
    .set({ status })
    .where(
      and(eq(application.id, id), inArray(application.status, currentStatuses))
    )
    .returning();
  return row ?? null;
}

export async function listStaleForOrganization(
  organizationId: string,
  olderThan: Date
) {
  return db
    .select({
      id: application.id,
      userId: application.userId,
      vacancyId: application.vacancyId,
      resumeId: application.resumeId,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    })
    .from(application)
    .innerJoin(vacancy, eq(application.vacancyId, vacancy.id))
    .where(
      and(
        eq(vacancy.organizationId, organizationId),
        inArray(application.status, ["SUBMITTED", "REVIEWING"]),
        lt(application.updatedAt, olderThan)
      )
    );
}
