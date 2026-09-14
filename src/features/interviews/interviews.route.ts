import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { requireApprovedCompany } from "../../auth/middleware.ts"
import { createRouter } from "../../lib/create-app.ts"
import { errorResponses } from "../../lib/http-errors.ts"
import { scheduleInterview } from "./interviews.controller.ts"
import { interviewSchema, scheduleInterviewBodySchema } from "./validator/interview.schema.ts"

export const scheduleInterviewRoute = createRoute({
  method: "post",
  path: "/schedule",
  tags: ["Interviews"],
  middleware: [requireApprovedCompany],
  request: {
    body: jsonContentRequired(scheduleInterviewBodySchema, "Interview details"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(interviewSchema, "Interview scheduled"),
    ...errorResponses,
  },
})

export type ScheduleInterviewRoute = typeof scheduleInterviewRoute

const interviews = createRouter().openapi(scheduleInterviewRoute, scheduleInterview)

export default interviews
