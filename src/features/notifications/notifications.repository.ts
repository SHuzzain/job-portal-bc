import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { member } from "../../auth/schema.ts";
import { db } from "../../db/index.ts";
import { user } from "../users/users.schema.ts";
import { notification } from "./notifications.schema.ts";

export type CreateNotificationRecord = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  href: string;
  entityType?: string | null;
  entityId?: string | null;
};

export async function insertNotification(data: CreateNotificationRecord) {
  const [row] = await db.insert(notification).values(data).returning();
  return row ?? null;
}

export async function listByUserId(userId: string) {
  return db
    .select()
    .from(notification)
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt));
}

export async function findById(id: string) {
  const [row] = await db
    .select()
    .from(notification)
    .where(eq(notification.id, id))
    .limit(1);
  return row ?? null;
}

export async function markRead(id: string, userId: string) {
  const [row] = await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.id, id), eq(notification.userId, userId)))
    .returning();
  return row ?? null;
}

export async function markAllRead(userId: string) {
  return db
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.userId, userId), isNull(notification.readAt)))
    .returning();
}

export async function countUnread(userId: string) {
  const rows = await db
    .select({ id: notification.id })
    .from(notification)
    .where(and(eq(notification.userId, userId), isNull(notification.readAt)));
  return rows.length;
}

export async function listMemberUserIds(organizationId: string) {
  const rows = await db
    .select({ userId: member.userId })
    .from(member)
    .where(eq(member.organizationId, organizationId));
  return rows.map((row) => row.userId);
}

export async function listAdminUserIds() {
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(inArray(user.role, ["admin", "super_admin"]));
  return rows.map((row) => row.id);
}
