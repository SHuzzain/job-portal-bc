import { eq } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { seekerProfile } from "./seeker-profiles.schema.ts";

export type UpdateSeekerProfileRecord = Partial<{
  displayName: string;
  icNumber: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  highestEducation: string;
  fieldOfStudy: string;
  yearsOfExperience: number;
  skills: string;
  preferredLocation: string;
  preferredEmploymentType: string;
  isMalaysian: boolean;
  hasWorkPermit: boolean;
}>;

export async function findByUserId(userId: string) {
  const [row] = await db
    .select()
    .from(seekerProfile)
    .where(eq(seekerProfile.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function insertProfile(userId: string) {
  const [row] = await db
    .insert(seekerProfile)
    .values({ id: crypto.randomUUID(), userId })
    .returning();
  return row ?? null;
}

export async function updateByUserId(
  userId: string,
  data: UpdateSeekerProfileRecord
) {
  const [row] = await db
    .update(seekerProfile)
    .set(data)
    .where(eq(seekerProfile.userId, userId))
    .returning();
  return row ?? null;
}
