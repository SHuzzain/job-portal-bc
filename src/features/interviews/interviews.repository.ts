import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { interview } from "./interviews.schema.ts";

export type CreateInterviewRecord = {
  id: string;
  applicationId: string;
  interviewDate: string;
  interviewTime: string;
  mode: string;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  status: string;
};

export async function insertInterview(data: CreateInterviewRecord) {
  const [row] = await db.insert(interview).values(data).returning();
  return row ?? null;
}

export async function listByApplicationId(applicationId: string) {
  return db
    .select()
    .from(interview)
    .where(eq(interview.applicationId, applicationId))
    .orderBy(desc(interview.createdAt));
}

export async function listByApplicationIds(applicationIds: string[]) {
  if (!applicationIds.length) {
    return [];
  }
  return db
    .select()
    .from(interview)
    .where(inArray(interview.applicationId, applicationIds))
    .orderBy(desc(interview.createdAt));
}

export async function cancelActiveByApplicationId(applicationId: string) {
  return db
    .update(interview)
    .set({ status: "CANCELLED" })
    .where(
      and(
        eq(interview.applicationId, applicationId),
        inArray(interview.status, ["SCHEDULED", "CONFIRMED"])
      )
    )
    .returning();
}

export async function updateStatusById(id: string, status: string) {
  const [row] = await db
    .update(interview)
    .set({ status })
    .where(eq(interview.id, id))
    .returning();
  return row ?? null;
}

export async function updateActiveStatusByApplicationId(
  applicationId: string,
  status: string
) {
  const [row] = await db
    .update(interview)
    .set({ status })
    .where(
      and(
        eq(interview.applicationId, applicationId),
        inArray(interview.status, ["SCHEDULED", "CONFIRMED"])
      )
    )
    .returning();
  return row ?? null;
}
