import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { requirePermission } from "../../auth/middleware.ts";
import { createRouter } from "../../lib/create-app.ts";
import { jsonErrors } from "../../lib/http-errors.ts";
import { getMine, updateMine } from "./seeker-profiles.controller.ts";
import {
  seekerProfileSchema,
  updateSeekerProfileBodySchema,
} from "./validator/seeker-profile.schema.ts";

export const getMineRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["SeekerProfiles"],
  middleware: [requirePermission("seeker_profile", "view")],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(seekerProfileSchema, "Seeker profile"),
    ...jsonErrors(HttpStatusCodes.UNAUTHORIZED, HttpStatusCodes.FORBIDDEN),
  },
});

export const updateMineRoute = createRoute({
  method: "patch",
  path: "/me",
  tags: ["SeekerProfiles"],
  middleware: [requirePermission("seeker_profile", "update")],
  request: {
    body: jsonContentRequired(
      updateSeekerProfileBodySchema,
      "Seeker profile fields"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      seekerProfileSchema,
      "Updated seeker profile"
    ),
    ...jsonErrors(HttpStatusCodes.UNAUTHORIZED, HttpStatusCodes.FORBIDDEN),
  },
});

export type GetMineRoute = typeof getMineRoute;
export type UpdateMineRoute = typeof updateMineRoute;

const seekerProfiles = createRouter()
  .openapi(getMineRoute, getMine)
  .openapi(updateMineRoute, updateMine);

export default seekerProfiles;
