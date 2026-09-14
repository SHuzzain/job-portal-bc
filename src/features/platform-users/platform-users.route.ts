import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { requirePermission } from "../../auth/middleware.ts"
import { createRouter } from "../../lib/create-app.ts"
import { errorResponses } from "../../lib/http-errors.ts"
import {
  assignPlatformRole,
  createPlatformUser,
  listPlatformUsers,
  updatePlatformUser,
} from "./platform-users.controller.ts"
import {
  assignPlatformRoleBodySchema,
  createPlatformUserBodySchema,
  platformUserIdParamSchema,
  platformUserSchema,
  updatePlatformUserBodySchema,
} from "./validator/platform-users.schema.ts"

export const listPlatformUsersRoute = createRoute({
  method: "get",
  path: "/users",
  tags: ["Platform Users"],
  middleware: [requirePermission("platform_user", "view")],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(platformUserSchema.array(), "Platform users"),
    ...errorResponses,
  },
})

export const createPlatformUserRoute = createRoute({
  method: "post",
  path: "/users",
  tags: ["Platform Users"],
  middleware: [requirePermission("platform_user", "create")],
  request: {
    body: jsonContentRequired(createPlatformUserBodySchema, "Platform user"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(platformUserSchema, "Created user"),
    ...errorResponses,
  },
})

export const assignPlatformRoleRoute = createRoute({
  method: "post",
  path: "/users/{id}/role",
  tags: ["Platform Users"],
  middleware: [requirePermission("platform_user", "set_role")],
  request: {
    params: platformUserIdParamSchema,
    body: jsonContentRequired(assignPlatformRoleBodySchema, "Platform role name"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(platformUserSchema, "Updated user"),
    ...errorResponses,
  },
})

export const updatePlatformUserRoute = createRoute({
  method: "patch",
  path: "/users/{id}",
  tags: ["Platform Users"],
  middleware: [requirePermission("platform_user", "update")],
  request: {
    params: platformUserIdParamSchema,
    body: jsonContentRequired(updatePlatformUserBodySchema, "Account status"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(platformUserSchema, "Updated user"),
    ...errorResponses,
  },
})

export type ListPlatformUsersRoute = typeof listPlatformUsersRoute
export type CreatePlatformUserRoute = typeof createPlatformUserRoute
export type AssignPlatformRoleRoute = typeof assignPlatformRoleRoute
export type UpdatePlatformUserRoute = typeof updatePlatformUserRoute

const platformUsers = createRouter()
  .openapi(listPlatformUsersRoute, listPlatformUsers)
  .openapi(createPlatformUserRoute, createPlatformUser)
  .openapi(assignPlatformRoleRoute, assignPlatformRole)
  .openapi(updatePlatformUserRoute, updatePlatformUser)

export default platformUsers
