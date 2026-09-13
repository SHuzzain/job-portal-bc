import * as notificationsRepository from "./notifications.repository.ts"

export class NotificationError extends Error {
  constructor(
    public status: 404,
    message: string,
  ) {
    super(message)
    this.name = "NotificationError"
  }
}

export type NotificationDraft = {
  type: string
  title: string
  body: string
  href: string
  entityType?: string
  entityId?: string
}

function toNotification(row: {
  id: string
  userId: string
  type: string
  title: string
  body: string
  href: string
  entityType: string | null
  entityId: string | null
  readAt: Date | null
  createdAt: Date
}) {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    entityType: row.entityType,
    entityId: row.entityId,
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function notify(userId: string, draft: NotificationDraft) {
  const row = await notificationsRepository.insertNotification({
    id: crypto.randomUUID(),
    userId,
    type: draft.type,
    title: draft.title,
    body: draft.body,
    href: draft.href,
    entityType: draft.entityType ?? null,
    entityId: draft.entityId ?? null,
  })
  return row ? toNotification(row) : null
}

export async function notifyMany(userIds: string[], draft: NotificationDraft) {
  const unique = [...new Set(userIds.filter(Boolean))]
  await Promise.all(unique.map((userId) => notify(userId, draft)))
}

export async function notifyOrganization(organizationId: string, draft: NotificationDraft) {
  const userIds = await notificationsRepository.listMemberUserIds(organizationId)
  await notifyMany(userIds, draft)
}

export async function notifyAdmins(draft: NotificationDraft) {
  const userIds = await notificationsRepository.listAdminUserIds()
  await notifyMany(userIds, draft)
}

export async function listMine(userId: string) {
  const rows = await notificationsRepository.listByUserId(userId)
  return rows.map(toNotification)
}

export async function unreadCount(userId: string) {
  return { count: await notificationsRepository.countUnread(userId) }
}

export async function markRead(userId: string, id: string) {
  const existing = await notificationsRepository.findById(id)
  if (!existing || existing.userId !== userId) {
    throw new NotificationError(404, "Notification not found")
  }
  const row = await notificationsRepository.markRead(id, userId)
  if (!row) {
    throw new NotificationError(404, "Notification not found")
  }
  return toNotification(row)
}

export async function markAllRead(userId: string) {
  const rows = await notificationsRepository.markAllRead(userId)
  return rows.map(toNotification)
}
