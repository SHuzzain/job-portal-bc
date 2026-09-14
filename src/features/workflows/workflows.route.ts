import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent } from "stoker/openapi/helpers"
import { requireApprovedCompany } from "../../auth/middleware.ts"
import { createRouter } from "../../lib/create-app.ts"
import { jsonErrors } from "../../lib/http-errors.ts"
import { staleSweepResultSchema } from "../applications/validator/application.schema.ts"
import { staleApplications } from "./workflows.controller.ts"

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
    ...jsonErrors(
      HttpStatusCodes.BAD_REQUEST,
      HttpStatusCodes.UNAUTHORIZED,
      HttpStatusCodes.FORBIDDEN,
    ),
  },
})

export type StaleApplicationsRoute = typeof staleApplicationsRoute

const workflows = createRouter().openapi(staleApplicationsRoute, staleApplications)

export default workflows
