import { z } from "@hono/zod-openapi"

export const notificationSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    type: z.string(),
    title: z.string(),
    body: z.string(),
    href: z.string(),
    entityType: z.string().nullable(),
    entityId: z.string().nullable(),
    read: z.boolean(),
    createdAt: z.string(),
  })
  .openapi("Notification")

export const unreadCountSchema = z
  .object({
    count: z.number().int(),
  })
  .openapi("NotificationUnreadCount")

export const notificationIdParamSchema = z
  .object({
    id: z.string().min(1),
  })
  .openapi("NotificationIdParam")
