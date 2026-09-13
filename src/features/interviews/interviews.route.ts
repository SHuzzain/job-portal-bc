import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { requireApprovedCompany } from "../../auth/middleware.ts"
import { createRouter } from "../../lib/create-app.ts"
import { scheduleInterview } from "./interviews.controller.ts"
import {
  errorMessageSchema,
  interviewSchema,
  scheduleInterviewBodySchema,
} from "./validator/interview.schema.ts"

const error = {
  [HttpStatusCodes.BAD_REQUEST]: jsonContent(errorMessageSchema, "Bad request"),
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(errorMessageSchema, "Unauthorized"),
  [HttpStatusCodes.FORBIDDEN]: jsonContent(errorMessageSchema, "Forbidden"),
  [HttpStatusCodes.NOT_FOUND]: jsonContent(errorMessageSchema, "Not found"),
}

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
    ...error,
  },
})

export type ScheduleInterviewRoute = typeof scheduleInterviewRoute

const interviews = createRouter().openapi(scheduleInterviewRoute, scheduleInterview)

export default interviews
