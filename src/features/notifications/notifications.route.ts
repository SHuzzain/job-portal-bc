import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent } from "stoker/openapi/helpers"
import { createRouter } from "../../lib/create-app.ts"
import { jsonErrors } from "../../lib/http-errors.ts"
import { listMine, markAllRead, markRead, unreadCount } from "./notifications.controller.ts"
import {
  notificationIdParamSchema,
  notificationSchema,
  unreadCountSchema,
} from "./validator/notification.schema.ts"

export const listMineRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Notifications"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(notificationSchema.array(), "My notifications"),
    ...jsonErrors(HttpStatusCodes.UNAUTHORIZED, HttpStatusCodes.NOT_FOUND),
  },
})

export const unreadCountRoute = createRoute({
  method: "get",
  path: "/unread-count",
  tags: ["Notifications"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(unreadCountSchema, "Unread count"),
    ...jsonErrors(HttpStatusCodes.UNAUTHORIZED, HttpStatusCodes.NOT_FOUND),
  },
})

export const markReadRoute = createRoute({
  method: "patch",
  path: "/{id}/read",
  tags: ["Notifications"],
  request: {
    params: notificationIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(notificationSchema, "Marked read"),
    ...jsonErrors(HttpStatusCodes.UNAUTHORIZED, HttpStatusCodes.NOT_FOUND),
  },
})

export const markAllReadRoute = createRoute({
  method: "post",
  path: "/read-all",
  tags: ["Notifications"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(notificationSchema.array(), "All marked read"),
    ...jsonErrors(HttpStatusCodes.UNAUTHORIZED, HttpStatusCodes.NOT_FOUND),
  },
})

export type ListMineRoute = typeof listMineRoute
export type UnreadCountRoute = typeof unreadCountRoute
export type MarkReadRoute = typeof markReadRoute
export type MarkAllReadRoute = typeof markAllReadRoute

const notifications = createRouter()
  .openapi(listMineRoute, listMine)
  .openapi(unreadCountRoute, unreadCount)
  .openapi(markAllReadRoute, markAllRead)
  .openapi(markReadRoute, markRead)

export default notifications
