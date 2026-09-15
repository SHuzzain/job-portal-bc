import { and, desc, eq, lte, notExists } from "drizzle-orm";

import { organization } from "../../auth/schema.ts";
import { db } from "../../db/index.ts";
import { tvetSession } from "../tvet/tvet.schema.ts";
import { tvetClaim } from "./tvet-claims.schema.ts";

const claimSelection = {
  claim: tvetClaim,
  courseTitle: tvetSession.title,
  courseStartsAt: tvetSession.startsAt,
  courseEndsAt: tvetSession.endsAt,
  providerName: organization.name,
};

export function listEligibleCourses(employerId: string, now: string) {
  return db
    .select({
      id: tvetSession.id,
      title: tvetSession.title,
      venue: tvetSession.venue,
      startsAt: tvetSession.startsAt,
      endsAt: tvetSession.endsAt,
    })
    .from(tvetSession)
    .where(
      and(
        eq(tvetSession.organizationId, employerId),
        lte(tvetSession.endsAt, now),
        notExists(
          db
            .select({ id: tvetClaim.id })
            .from(tvetClaim)
            .where(
              and(
                eq(tvetClaim.courseId, tvetSession.id),
                eq(tvetClaim.employerId, employerId)
              )
            )
        )
      )
    )
    .orderBy(desc(tvetSession.endsAt));
}

export async function findCourse(id: string) {
  const [row] = await db
    .select()
    .from(tvetSession)
    .where(eq(tvetSession.id, id))
    .limit(1);
  return row ?? null;
}

export async function insertClaim(data: typeof tvetClaim.$inferInsert) {
  const [row] = await db.insert(tvetClaim).values(data).returning();
  return row ?? null;
}

function claimsQuery() {
  return db
    .select(claimSelection)
    .from(tvetClaim)
    .innerJoin(tvetSession, eq(tvetClaim.courseId, tvetSession.id))
    .innerJoin(organization, eq(tvetClaim.employerId, organization.id));
}

export function listClaimsByProvider(employerId: string) {
  return claimsQuery()
    .where(eq(tvetClaim.employerId, employerId))
    .orderBy(desc(tvetClaim.createdAt));
}

export function listAllClaims() {
  return claimsQuery().orderBy(desc(tvetClaim.createdAt));
}

export async function findClaim(id: string) {
  const [row] = await claimsQuery().where(eq(tvetClaim.id, id)).limit(1);
  return row ?? null;
}

export async function transitionClaim(
  id: string,
  expectedStatus: "SUBMITTED" | "FINANCE_APPROVED" | "SIGNED_DOC_SUBMITTED",
  data: Partial<typeof tvetClaim.$inferInsert>
) {
  const [row] = await db
    .update(tvetClaim)
    .set(data)
    .where(and(eq(tvetClaim.id, id), eq(tvetClaim.status, expectedStatus)))
    .returning();
  return row ?? null;
}
