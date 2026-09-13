import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { requireJobseeker, requireTvetCompany } from "../../auth/middleware.ts"
import { createRouter } from "../../lib/create-app.ts"
import {
  createRfp,
  createSession,
  getSession,
  listMyAttendance,
  listRfps,
  listSessions,
  scan,
  updateRfp,
} from "./tvet.controller.ts"
import {
  createRfpBodySchema,
  createSessionBodySchema,
  errorMessageSchema,
  listSessionsQuerySchema,
  scanBodySchema,
  tvetAttendanceSchema,
  tvetIdParamSchema,
  tvetRfpSchema,
  tvetSessionDetailSchema,
  tvetSessionSchema,
  updateRfpBodySchema,
} from "./validator/tvet.schema.ts"

const error = {
  [HttpStatusCodes.BAD_REQUEST]: jsonContent(errorMessageSchema, "Bad request"),
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(errorMessageSchema, "Unauthorized"),
  [HttpStatusCodes.FORBIDDEN]: jsonContent(errorMessageSchema, "Forbidden"),
  [HttpStatusCodes.NOT_FOUND]: jsonContent(errorMessageSchema, "Not found"),
  [HttpStatusCodes.CONFLICT]: jsonContent(errorMessageSchema, "Conflict"),
}

export const listRfpsRoute = createRoute({
  method: "get",
  path: "/rfps",
  tags: ["TVET"],
  middleware: [requireTvetCompany],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(tvetRfpSchema.array(), "Company RFPs"),
    ...error,
  },
})

export const createRfpRoute = createRoute({
  method: "post",
  path: "/rfps",
  tags: ["TVET"],
  middleware: [requireTvetCompany],
  request: {
    body: jsonContentRequired(createRfpBodySchema, "RFP"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(tvetRfpSchema, "Created RFP"),
    ...error,
  },
})

export const updateRfpRoute = createRoute({
  method: "patch",
  path: "/rfps/{id}",
  tags: ["TVET"],
  middleware: [requireTvetCompany],
  request: {
    params: tvetIdParamSchema,
    body: jsonContentRequired(updateRfpBodySchema, "RFP fields"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(tvetRfpSchema, "Updated RFP"),
    ...error,
  },
})

export const listSessionsRoute = createRoute({
  method: "get",
  path: "/sessions",
  tags: ["TVET"],
  middleware: [requireTvetCompany],
  request: {
    query: listSessionsQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(tvetSessionSchema.array(), "Company sessions"),
    ...error,
  },
})

export const createSessionRoute = createRoute({
  method: "post",
  path: "/sessions",
  tags: ["TVET"],
  middleware: [requireTvetCompany],
  request: {
    body: jsonContentRequired(createSessionBodySchema, "Session"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(tvetSessionSchema, "Created session"),
    ...error,
  },
})

export const getSessionRoute = createRoute({
  method: "get",
  path: "/sessions/{id}",
  tags: ["TVET"],
  middleware: [requireTvetCompany],
  request: {
    params: tvetIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(tvetSessionDetailSchema, "Session with attendance"),
    ...error,
  },
})

export const scanRoute = createRoute({
  method: "post",
  path: "/scan",
  tags: ["TVET"],
  middleware: [requireJobseeker],
  request: {
    body: jsonContentRequired(scanBodySchema, "Barcode"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(tvetAttendanceSchema, "Attendance recorded"),
    ...error,
  },
})

export const listMyAttendanceRoute = createRoute({
  method: "get",
  path: "/attendance/mine",
  tags: ["TVET"],
  middleware: [requireJobseeker],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(tvetAttendanceSchema.array(), "My attendance"),
    ...error,
  },
})

export type ListRfpsRoute = typeof listRfpsRoute
export type CreateRfpRoute = typeof createRfpRoute
export type UpdateRfpRoute = typeof updateRfpRoute
export type ListSessionsRoute = typeof listSessionsRoute
export type CreateSessionRoute = typeof createSessionRoute
export type GetSessionRoute = typeof getSessionRoute
export type ScanRoute = typeof scanRoute
export type ListMyAttendanceRoute = typeof listMyAttendanceRoute

const tvet = createRouter()
  .openapi(listRfpsRoute, listRfps)
  .openapi(createRfpRoute, createRfp)
  .openapi(updateRfpRoute, updateRfp)
  .openapi(listSessionsRoute, listSessions)
  .openapi(createSessionRoute, createSession)
  .openapi(getSessionRoute, getSession)
  .openapi(scanRoute, scan)
  .openapi(listMyAttendanceRoute, listMyAttendance)

export default tvet
