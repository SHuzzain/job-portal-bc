import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { createRouter } from "../../lib/create-app.ts";
import { jsonErrors } from "../../lib/http-errors.ts";
import { updateMe, updatePhone, updateWorkspace } from "./users.controller.ts";
import { updatePhoneBodySchema } from "./validator/update-phone.schema.ts";
import {
  updateUserBodySchema,
  updateUserResponseSchema,
} from "./validator/update-user.schema.ts";
import {
  updateWorkspaceBodySchema,
  updateWorkspaceResponseSchema,
} from "./validator/update-workspace.schema.ts";

export const updateMeRoute = createRoute({
  method: "patch",
  path: "/me",
  tags: ["Users"],
  request: {
    body: jsonContentRequired(updateUserBodySchema, "Profile fields"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      updateUserResponseSchema,
      "Updated profile"
    ),
    ...jsonErrors(HttpStatusCodes.UNAUTHORIZED, HttpStatusCodes.NOT_FOUND),
  },
});

export const updatePhoneRoute = createRoute({
  method: "patch",
  path: "/me/phone",
  tags: ["Users"],
  request: {
    body: jsonContentRequired(updatePhoneBodySchema, "Phone number"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      updateUserResponseSchema,
      "Updated phone number"
    ),
    ...jsonErrors(HttpStatusCodes.UNAUTHORIZED, HttpStatusCodes.NOT_FOUND),
  },
});

export const updateWorkspaceRoute = createRoute({
  method: "patch",
  path: "/me/workspace",
  tags: ["Users"],
  request: {
    body: jsonContentRequired(updateWorkspaceBodySchema, "Workspace"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      updateWorkspaceResponseSchema,
      "Updated workspace"
    ),
    ...jsonErrors(
      HttpStatusCodes.BAD_REQUEST,
      HttpStatusCodes.UNAUTHORIZED,
      HttpStatusCodes.FORBIDDEN,
      HttpStatusCodes.NOT_FOUND
    ),
  },
});

export type UpdateMeRoute = typeof updateMeRoute;
export type UpdatePhoneRoute = typeof updatePhoneRoute;
export type UpdateWorkspaceRoute = typeof updateWorkspaceRoute;

const users = createRouter()
  .openapi(updateMeRoute, updateMe)
  .openapi(updatePhoneRoute, updatePhone)
  .openapi(updateWorkspaceRoute, updateWorkspace);

export default users;
