import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { requireJobseeker } from "../../auth/middleware.ts"
import { createRouter } from "../../lib/create-app.ts"
import { getMine, updateMine } from "./seeker-profiles.controller.ts"
import {
  errorMessageSchema,
  seekerProfileSchema,
  updateSeekerProfileBodySchema,
} from "./validator/seeker-profile.schema.ts"

const error = {
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(errorMessageSchema, "Unauthorized"),
  [HttpStatusCodes.FORBIDDEN]: jsonContent(errorMessageSchema, "Forbidden"),
}

export const getMineRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["SeekerProfiles"],
  middleware: [requireJobseeker],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(seekerProfileSchema, "Seeker profile"),
    ...error,
  },
})

export const updateMineRoute = createRoute({
  method: "patch",
  path: "/me",
  tags: ["SeekerProfiles"],
  middleware: [requireJobseeker],
  request: {
    body: jsonContentRequired(updateSeekerProfileBodySchema, "Seeker profile fields"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(seekerProfileSchema, "Updated seeker profile"),
    ...error,
  },
})

export type GetMineRoute = typeof getMineRoute
export type UpdateMineRoute = typeof updateMineRoute

const seekerProfiles = createRouter()
  .openapi(getMineRoute, getMine)
  .openapi(updateMineRoute, updateMine)

export default seekerProfiles
