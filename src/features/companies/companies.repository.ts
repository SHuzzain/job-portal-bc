import { and, eq } from "drizzle-orm";

import { member } from "../../auth/schema.ts";
import { db } from "../../db/index.ts";

export async function findMembership(organizationId: string, userId: string) {
  const [row] = await db
    .select({ id: member.id })
    .from(member)
    .where(
      and(eq(member.organizationId, organizationId), eq(member.userId, userId))
    )
    .limit(1);
  return row ?? null;
}
