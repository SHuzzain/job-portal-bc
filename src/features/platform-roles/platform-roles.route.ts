import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { requirePermission } from "../../auth/middleware.ts";
import { createRouter } from "../../lib/create-app.ts";
import { errorResponses } from "../../lib/http-errors.ts";
import {
  createPlatformRole,
  deletePlatformRole,
  getPlatformRole,
  listPlatformRoles,
  updatePlatformRole,
} from "./platform-roles.controller.ts";
import {
  createPlatformRoleBodySchema,
  platformRoleIdParamSchema,
  platformRoleSchema,
  updatePlatformRoleBodySchema,
} from "./validator/platform-roles.schema.ts";

export const listPlatformRolesRoute = createRoute({
  method: "get",
  path: "/roles",
  tags: ["Platform Roles"],
  middleware: [requirePermission("platform_role", "view")],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      platformRoleSchema.array(),
      "Platform roles"
    ),
    ...errorResponses,
  },
});

export const getPlatformRoleRoute = createRoute({
  method: "get",
  path: "/roles/{id}",
  tags: ["Platform Roles"],
  middleware: [requirePermission("platform_role", "view")],
  request: { params: platformRoleIdParamSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(platformRoleSchema, "Platform role"),
    ...errorResponses,
  },
});

export const createPlatformRoleRoute = createRoute({
  method: "post",
  path: "/roles",
  tags: ["Platform Roles"],
  middleware: [requirePermission("platform_role", "create")],
  request: {
    body: jsonContentRequired(createPlatformRoleBodySchema, "Platform role"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(platformRoleSchema, "Created role"),
    ...errorResponses,
  },
});

export const updatePlatformRoleRoute = createRoute({
  method: "patch",
  path: "/roles/{id}",
  tags: ["Platform Roles"],
  middleware: [requirePermission("platform_role", "update")],
  request: {
    params: platformRoleIdParamSchema,
    body: jsonContentRequired(updatePlatformRoleBodySchema, "Role changes"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(platformRoleSchema, "Updated role"),
    ...errorResponses,
  },
});

export const deletePlatformRoleRoute = createRoute({
  method: "delete",
  path: "/roles/{id}",
  tags: ["Platform Roles"],
  middleware: [requirePermission("platform_role", "delete")],
  request: { params: platformRoleIdParamSchema },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Deleted" },
    ...errorResponses,
  },
});

export type ListPlatformRolesRoute = typeof listPlatformRolesRoute;
export type GetPlatformRoleRoute = typeof getPlatformRoleRoute;
export type CreatePlatformRoleRoute = typeof createPlatformRoleRoute;
export type UpdatePlatformRoleRoute = typeof updatePlatformRoleRoute;
export type DeletePlatformRoleRoute = typeof deletePlatformRoleRoute;

const platformRoles = createRouter()
  .openapi(listPlatformRolesRoute, listPlatformRoles)
  .openapi(getPlatformRoleRoute, getPlatformRole)
  .openapi(createPlatformRoleRoute, createPlatformRole)
  .openapi(updatePlatformRoleRoute, updatePlatformRole)
  .openapi(deletePlatformRoleRoute, deletePlatformRole);

export default platformRoles;
