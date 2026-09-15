import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import {
  requirePermission,
  requireTvetPermission,
} from "../../auth/middleware.ts";
import { createRouter } from "../../lib/create-app.ts";
import { errorResponses } from "../../lib/http-errors.ts";
import {
  createRfp,
  createSession,
  downloadCertificate,
  getCertificate,
  getSession,
  listMyAttendance,
  listRfps,
  listSessions,
  scan,
  submitSurvey,
  updateRfp,
} from "./tvet.controller.ts";
import {
  createRfpBodySchema,
  createSessionBodySchema,
  listSessionsQuerySchema,
  scanBodySchema,
  submitSurveyBodySchema,
  tvetAttendanceSchema,
  tvetCertificateSchema,
  tvetIdParamSchema,
  tvetRfpSchema,
  tvetSessionDetailSchema,
  tvetSessionSchema,
  updateRfpBodySchema,
} from "./validator/tvet.schema.ts";

export const listRfpsRoute = createRoute({
  method: "get",
  path: "/rfps",
  tags: ["TVET"],
  middleware: [requireTvetPermission("tvet_rfp", "view")],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(tvetRfpSchema.array(), "Company RFPs"),
    ...errorResponses,
  },
});

export const createRfpRoute = createRoute({
  method: "post",
  path: "/rfps",
  tags: ["TVET"],
  middleware: [requireTvetPermission("tvet_rfp", "create")],
  request: {
    body: jsonContentRequired(createRfpBodySchema, "RFP"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(tvetRfpSchema, "Created RFP"),
    ...errorResponses,
  },
});

export const updateRfpRoute = createRoute({
  method: "patch",
  path: "/rfps/{id}",
  tags: ["TVET"],
  middleware: [requireTvetPermission("tvet_rfp", "update")],
  request: {
    params: tvetIdParamSchema,
    body: jsonContentRequired(updateRfpBodySchema, "RFP fields"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(tvetRfpSchema, "Updated RFP"),
    ...errorResponses,
  },
});

export const listSessionsRoute = createRoute({
  method: "get",
  path: "/sessions",
  tags: ["TVET"],
  middleware: [requireTvetPermission("tvet_session", "view")],
  request: {
    query: listSessionsQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      tvetSessionSchema.array(),
      "Company sessions"
    ),
    ...errorResponses,
  },
});

export const createSessionRoute = createRoute({
  method: "post",
  path: "/sessions",
  tags: ["TVET"],
  middleware: [requireTvetPermission("tvet_session", "create")],
  request: {
    body: jsonContentRequired(createSessionBodySchema, "Session"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      tvetSessionSchema,
      "Created session"
    ),
    ...errorResponses,
  },
});

export const getSessionRoute = createRoute({
  method: "get",
  path: "/sessions/{id}",
  tags: ["TVET"],
  middleware: [requireTvetPermission("tvet_session", "view")],
  request: {
    params: tvetIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      tvetSessionDetailSchema,
      "Session with attendance"
    ),
    ...errorResponses,
  },
});

export const scanRoute = createRoute({
  method: "post",
  path: "/scan",
  tags: ["TVET"],
  middleware: [requirePermission("tvet_attendance", "scan")],
  request: {
    body: jsonContentRequired(scanBodySchema, "Barcode"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      tvetAttendanceSchema,
      "Attendance recorded"
    ),
    ...errorResponses,
  },
});

export const listMyAttendanceRoute = createRoute({
  method: "get",
  path: "/attendance/mine",
  tags: ["TVET"],
  middleware: [requirePermission("tvet_attendance", "view")],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      tvetAttendanceSchema.array(),
      "My attendance"
    ),
    ...errorResponses,
  },
});

export const submitSurveyRoute = createRoute({
  method: "post",
  path: "/sessions/{id}/survey",
  tags: ["TVET"],
  middleware: [requirePermission("tvet_certificate", "submit_survey")],
  request: {
    params: tvetIdParamSchema,
    body: jsonContentRequired(submitSurveyBodySchema, "Course survey"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      tvetCertificateSchema,
      "Certificate unlocked"
    ),
    ...errorResponses,
  },
});

export const getCertificateRoute = createRoute({
  method: "get",
  path: "/sessions/{id}/certificate",
  tags: ["TVET"],
  middleware: [requirePermission("tvet_certificate", "view")],
  request: {
    params: tvetIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      tvetCertificateSchema,
      "Certificate metadata"
    ),
    ...errorResponses,
  },
});

export const downloadCertificateRoute = createRoute({
  method: "get",
  path: "/sessions/{id}/certificate/download",
  tags: ["TVET"],
  middleware: [requirePermission("tvet_certificate", "download")],
  request: {
    params: tvetIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Certificate PDF",
      content: {
        "application/pdf": {
          schema: z.string().openapi({ format: "binary" }),
        },
      },
    },
    ...errorResponses,
  },
});

export type ListRfpsRoute = typeof listRfpsRoute;
export type CreateRfpRoute = typeof createRfpRoute;
export type UpdateRfpRoute = typeof updateRfpRoute;
export type ListSessionsRoute = typeof listSessionsRoute;
export type CreateSessionRoute = typeof createSessionRoute;
export type GetSessionRoute = typeof getSessionRoute;
export type ScanRoute = typeof scanRoute;
export type ListMyAttendanceRoute = typeof listMyAttendanceRoute;
export type SubmitSurveyRoute = typeof submitSurveyRoute;
export type GetCertificateRoute = typeof getCertificateRoute;
export type DownloadCertificateRoute = typeof downloadCertificateRoute;

const tvet = createRouter()
  .openapi(listRfpsRoute, listRfps)
  .openapi(createRfpRoute, createRfp)
  .openapi(updateRfpRoute, updateRfp)
  .openapi(listSessionsRoute, listSessions)
  .openapi(createSessionRoute, createSession)
  .openapi(getSessionRoute, getSession)
  .openapi(scanRoute, scan)
  .openapi(listMyAttendanceRoute, listMyAttendance)
  .openapi(submitSurveyRoute, submitSurvey)
  .openapi(getCertificateRoute, getCertificate)
  .openapi(downloadCertificateRoute, downloadCertificate);

export default tvet;
