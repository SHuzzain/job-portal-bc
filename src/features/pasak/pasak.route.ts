import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { requirePasakAdmin } from "../../auth/middleware.ts"
import { createRouter } from "../../lib/create-app.ts"
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
  errorMessageSchema,
  listCompaniesQuerySchema,
  listPasakVacanciesQuerySchema,
  pasakEmployerSchema,
  reviewBodySchema,
  setCompanyStatusBodySchema,
  setTvetCapabilityBodySchema,
  setVacancyStatusBodySchema,
  vacancyIdParamSchema,
} from "./validator/pasak.schema.ts"

const error = {
  [HttpStatusCodes.BAD_REQUEST]: jsonContent(errorMessageSchema, "Bad request"),
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(errorMessageSchema, "Unauthorized"),
  [HttpStatusCodes.FORBIDDEN]: jsonContent(errorMessageSchema, "Forbidden"),
  [HttpStatusCodes.NOT_FOUND]: jsonContent(errorMessageSchema, "Not found"),
}

export const listCompaniesRoute = createRoute({
  method: "get",
  path: "/companies",
  tags: ["PASAK"],
  middleware: [requirePasakAdmin],
  request: {
    query: listCompaniesQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(companySchema.array(), "Companies"),
    ...error,
  },
})

export const setCompanyStatusRoute = createRoute({
  method: "patch",
  path: "/companies/{id}",
  tags: ["PASAK"],
  middleware: [requirePasakAdmin],
  request: {
    params: companyIdParamSchema,
    body: jsonContentRequired(setCompanyStatusBodySchema, "Company status"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(companySchema, "Updated company"),
    ...error,
  },
})

export const listVacanciesRoute = createRoute({
  method: "get",
  path: "/vacancies",
  tags: ["PASAK"],
  middleware: [requirePasakAdmin],
  request: {
    query: listPasakVacanciesQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(vacancySchema.array(), "Vacancies"),
    ...error,
  },
})

export const reviewCompanyRoute = createRoute({
  method: "post",
  path: "/companies/{id}/review",
  tags: ["PASAK"],
  middleware: [requirePasakAdmin],
  request: {
    params: companyIdParamSchema,
    body: jsonContentRequired(reviewBodySchema, "Review action"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(companySchema, "Reviewed company"),
    ...error,
  },
})

export const reviewVacancyRoute = createRoute({
  method: "post",
  path: "/vacancies/{id}/review",
  tags: ["PASAK"],
  middleware: [requirePasakAdmin],
  request: {
    params: vacancyIdParamSchema,
    body: jsonContentRequired(reviewBodySchema, "Review action"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(vacancySchema, "Reviewed vacancy"),
    ...error,
  },
})

export const setVacancyStatusRoute = createRoute({
  method: "patch",
  path: "/vacancies/{id}",
  tags: ["PASAK"],
  middleware: [requirePasakAdmin],
  request: {
    params: vacancyIdParamSchema,
    body: jsonContentRequired(setVacancyStatusBodySchema, "Vacancy status"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(vacancySchema, "Updated vacancy"),
    ...error,
  },
})

export const listEmployersRoute = createRoute({
  method: "get",
  path: "/employers",
  tags: ["PASAK"],
  middleware: [requirePasakAdmin],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(pasakEmployerSchema.array(), "Employer accounts"),
    ...error,
  },
})

export const setTvetCapabilityRoute = createRoute({
  method: "patch",
  path: "/employers/{id}",
  tags: ["PASAK"],
  middleware: [requirePasakAdmin],
  request: {
    params: employerIdParamSchema,
    body: jsonContentRequired(setTvetCapabilityBodySchema, "TVET capability"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(pasakEmployerSchema, "Updated employer TVET capability"),
    ...error,
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
