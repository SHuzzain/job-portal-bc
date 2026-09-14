import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { requirePermission, requirePermissionFor } from "../../auth/middleware.ts"

const reviewActions: Record<string, string> = {
  APPROVE: "approve",
  REJECT: "reject",
  RETURN_FOR_CORRECTION: "return",
}

const statusActions: Record<string, string> = {
  APPROVED: "approve",
  REJECTED: "reject",
}

function reviewAction(body: Record<string, unknown>) {
  return typeof body.action === "string" ? (reviewActions[body.action] ?? null) : null
}

function statusAction(body: Record<string, unknown>) {
  return typeof body.status === "string" ? (statusActions[body.status] ?? null) : null
}
import { createRouter } from "../../lib/create-app.ts"
import { errorResponses } from "../../lib/http-errors.ts"
import { vacancySchema } from "../vacancies/validator/vacancy.schema.ts"
import {
  listCompanies,
  listEmployers,
  listVacancies,
  reviewCompany,
  reviewVacancy,
  setCompanyStatus,
  setTvetCapability,
  setVacancyStatus,
} from "./pasak.controller.ts"
import {
  companyIdParamSchema,
  companySchema,
  employerIdParamSchema,
  listCompaniesQuerySchema,
  listPasakVacanciesQuerySchema,
  pasakEmployerSchema,
  reviewBodySchema,
  setCompanyStatusBodySchema,
  setTvetCapabilityBodySchema,
  setVacancyStatusBodySchema,
  vacancyIdParamSchema,
} from "./validator/pasak.schema.ts"

export const listCompaniesRoute = createRoute({
  method: "get",
  path: "/companies",
  tags: ["PASAK"],
  middleware: [requirePermission("company_review", "view")],
  request: {
    query: listCompaniesQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(companySchema.array(), "Companies"),
    ...errorResponses,
  },
})

export const setCompanyStatusRoute = createRoute({
  method: "patch",
  path: "/companies/{id}",
  tags: ["PASAK"],
  middleware: [requirePermissionFor("company_review", statusAction)],
  request: {
    params: companyIdParamSchema,
    body: jsonContentRequired(setCompanyStatusBodySchema, "Company status"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(companySchema, "Updated company"),
    ...errorResponses,
  },
})

export const listVacanciesRoute = createRoute({
  method: "get",
  path: "/vacancies",
  tags: ["PASAK"],
  middleware: [requirePermission("vacancy_review", "view")],
  request: {
    query: listPasakVacanciesQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(vacancySchema.array(), "Vacancies"),
    ...errorResponses,
  },
})

export const reviewCompanyRoute = createRoute({
  method: "post",
  path: "/companies/{id}/review",
  tags: ["PASAK"],
  middleware: [requirePermissionFor("company_review", reviewAction)],
  request: {
    params: companyIdParamSchema,
    body: jsonContentRequired(reviewBodySchema, "Review action"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(companySchema, "Reviewed company"),
    ...errorResponses,
  },
})

export const reviewVacancyRoute = createRoute({
  method: "post",
  path: "/vacancies/{id}/review",
  tags: ["PASAK"],
  middleware: [requirePermissionFor("vacancy_review", reviewAction)],
  request: {
    params: vacancyIdParamSchema,
    body: jsonContentRequired(reviewBodySchema, "Review action"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(vacancySchema, "Reviewed vacancy"),
    ...errorResponses,
  },
})

export const setVacancyStatusRoute = createRoute({
  method: "patch",
  path: "/vacancies/{id}",
  tags: ["PASAK"],
  middleware: [requirePermissionFor("vacancy_review", statusAction)],
  request: {
    params: vacancyIdParamSchema,
    body: jsonContentRequired(setVacancyStatusBodySchema, "Vacancy status"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(vacancySchema, "Updated vacancy"),
    ...errorResponses,
  },
})

export const listEmployersRoute = createRoute({
  method: "get",
  path: "/employers",
  tags: ["PASAK"],
  middleware: [requirePermission("tvet_capability", "view")],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(pasakEmployerSchema.array(), "Employer accounts"),
    ...errorResponses,
  },
})

export const setTvetCapabilityRoute = createRoute({
  method: "patch",
  path: "/employers/{id}",
  tags: ["PASAK"],
  middleware: [
    requirePermissionFor("tvet_capability", (body) =>
      typeof body.hasTvetCapability === "boolean"
        ? body.hasTvetCapability
          ? "grant"
          : "revoke"
        : null,
    ),
  ],
  request: {
    params: employerIdParamSchema,
    body: jsonContentRequired(setTvetCapabilityBodySchema, "TVET capability"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(pasakEmployerSchema, "Updated employer TVET capability"),
    ...errorResponses,
  },
})

export type ListCompaniesRoute = typeof listCompaniesRoute
export type SetCompanyStatusRoute = typeof setCompanyStatusRoute
export type ListVacanciesRoute = typeof listVacanciesRoute
export type ReviewCompanyRoute = typeof reviewCompanyRoute
export type ReviewVacancyRoute = typeof reviewVacancyRoute
export type SetVacancyStatusRoute = typeof setVacancyStatusRoute
export type ListEmployersRoute = typeof listEmployersRoute
export type SetTvetCapabilityRoute = typeof setTvetCapabilityRoute

const pasak = createRouter()
  .openapi(listCompaniesRoute, listCompanies)
  .openapi(reviewCompanyRoute, reviewCompany)
  .openapi(setCompanyStatusRoute, setCompanyStatus)
  .openapi(listVacanciesRoute, listVacancies)
  .openapi(reviewVacancyRoute, reviewVacancy)
  .openapi(setVacancyStatusRoute, setVacancyStatus)
  .openapi(listEmployersRoute, listEmployers)
  .openapi(setTvetCapabilityRoute, setTvetCapability)

export default pasak
