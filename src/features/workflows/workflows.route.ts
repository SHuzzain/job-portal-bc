import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent } from "stoker/openapi/helpers"
import { requireApprovedCompany } from "../../auth/middleware.ts"
import { createRouter } from "../../lib/create-app.ts"
import {
  errorMessageSchema,
  staleSweepResultSchema,
} from "../applications/validator/application.schema.ts"
import { staleApplications } from "./workflows.controller.ts"

const error = {
  [HttpStatusCodes.BAD_REQUEST]: jsonContent(errorMessageSchema, "Bad request"),
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(errorMessageSchema, "Unauthorized"),
  [HttpStatusCodes.FORBIDDEN]: jsonContent(errorMessageSchema, "Forbidden"),
}

export const staleApplicationsRoute = createRoute({
  method: "post",
  path: "/stale-applications",
  tags: ["Workflows"],
  middleware: [requireApprovedCompany],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      staleSweepResultSchema,
      "Applications with no status update for 90 days marked FAILED",
    ),
    ...error,
  },
})

export type StaleApplicationsRoute = typeof staleApplicationsRoute

const workflows = createRouter().openapi(staleApplicationsRoute, staleApplications)

export default workflows
