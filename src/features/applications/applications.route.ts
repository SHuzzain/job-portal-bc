import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { requireApprovedCompany, requireJobseeker } from "../../auth/middleware.ts"
import { createRouter } from "../../lib/create-app.ts"
import { errorResponses } from "../../lib/http-errors.ts"
import {
  create as createApplication,
  followUp,
  get as getApplication,
  listForVacancy,
  listMine,
  setStatus,
} from "./applications.controller.ts"
import {
  applicationIdParamSchema,
  applicationSchema,
  createApplicationBodySchema,
  setApplicationStatusBodySchema,
  vacancyIdParamSchema,
} from "./validator/application.schema.ts"

export const createApplicationRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Applications"],
  middleware: [requireJobseeker],
  request: {
    body: jsonContentRequired(createApplicationBodySchema, "Application"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(applicationSchema, "Application submitted"),
    ...errorResponses,
  },
})

export const listMineRoute = createRoute({
  method: "get",
  path: "/mine",
  tags: ["Applications"],
  middleware: [requireJobseeker],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(applicationSchema.array(), "My applications"),
    ...errorResponses,
  },
})

export const listForVacancyRoute = createRoute({
  method: "get",
  path: "/vacancy/{vacancyId}",
  tags: ["Applications"],
  middleware: [requireApprovedCompany],
  request: {
    params: vacancyIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(applicationSchema.array(), "Applicants for a company vacancy"),
    ...errorResponses,
  },
})

export const getApplicationRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Applications"],
  request: {
    params: applicationIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(applicationSchema, "Application"),
    ...errorResponses,
  },
})

export const setStatusRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Applications"],
  middleware: [requireApprovedCompany],
  request: {
    params: applicationIdParamSchema,
    body: jsonContentRequired(setApplicationStatusBodySchema, "Application status"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(applicationSchema, "Updated application"),
    ...errorResponses,
  },
})

export const followUpRoute = createRoute({
  method: "post",
  path: "/{id}/follow-up",
  tags: ["Applications"],
  middleware: [requireApprovedCompany],
  request: {
    params: applicationIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(applicationSchema, "Follow-up sent"),
    ...errorResponses,
  },
})

export type CreateApplicationRoute = typeof createApplicationRoute
export type ListMineRoute = typeof listMineRoute
export type ListForVacancyRoute = typeof listForVacancyRoute
export type GetApplicationRoute = typeof getApplicationRoute
export type SetStatusRoute = typeof setStatusRoute
export type FollowUpRoute = typeof followUpRoute

const applications = createRouter()
  .openapi(createApplicationRoute, createApplication)
  .openapi(listMineRoute, listMine)
  .openapi(listForVacancyRoute, listForVacancy)
  .openapi(followUpRoute, followUp)
  .openapi(getApplicationRoute, getApplication)
  .openapi(setStatusRoute, setStatus)

export default applications
