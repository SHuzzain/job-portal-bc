import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent } from "stoker/openapi/helpers"
import { createRouter } from "../../lib/create-app.ts"
import { listMine, markAllRead, markRead, unreadCount } from "./notifications.controller.ts"
import {
  errorMessageSchema,
  notificationIdParamSchema,
  notificationSchema,
  unreadCountSchema,
} from "./validator/notification.schema.ts"

const error = {
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(errorMessageSchema, "Unauthorized"),
  [HttpStatusCodes.NOT_FOUND]: jsonContent(errorMessageSchema, "Not found"),
}

export const listMineRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Notifications"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(notificationSchema.array(), "My notifications"),
    ...error,
  },
})

export const unreadCountRoute = createRoute({
  method: "get",
  path: "/unread-count",
  tags: ["Notifications"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(unreadCountSchema, "Unread count"),
    ...error,
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
    ...error,
  },
})

export const markAllReadRoute = createRoute({
  method: "post",
  path: "/read-all",
  tags: ["Notifications"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(notificationSchema.array(), "All marked read"),
    ...error,
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
