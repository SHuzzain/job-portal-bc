import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import {
  requireActiveCompany,
  requireCompanyPermission,
  requirePermission,
} from "../../auth/middleware.ts";
import { createRouter } from "../../lib/create-app.ts";
import { errorResponses, jsonErrors } from "../../lib/http-errors.ts";
import {
  create as createVacancy,
  deleteVacancy,
  getMine as getMineVacancy,
  get as getVacancy,
  listMine as listMineVacancies,
  listPublic as listPublicVacancies,
  resubmit as resubmitVacancy,
  update as updateVacancy,
} from "./vacancies.controller.ts";
import {
  createVacancyBodySchema,
  listVacanciesQuerySchema,
  updateVacancyBodySchema,
  vacancyIdParamSchema,
  vacancySchema,
} from "./validator/vacancy.schema.ts";

export const listPublicVacanciesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Vacancies"],
  request: {
    query: listVacanciesQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      vacancySchema.array(),
      "Approved vacancies"
    ),
  },
});

export const listMineVacanciesRoute = createRoute({
  method: "get",
  path: "/mine",
  tags: ["Vacancies"],
  middleware: [requireActiveCompany, requirePermission("vacancy", "view")],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      vacancySchema.array(),
      "Vacancies for the active company"
    ),
    ...jsonErrors(HttpStatusCodes.BAD_REQUEST, HttpStatusCodes.UNAUTHORIZED),
  },
});

export const getVacancyRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Vacancies"],
  request: {
    params: vacancyIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(vacancySchema, "Approved vacancy"),
    ...jsonErrors(HttpStatusCodes.NOT_FOUND),
  },
});

export const createVacancyRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Vacancies"],
  middleware: [requireCompanyPermission("vacancy", "create")],
  request: {
    body: jsonContentRequired(createVacancyBodySchema, "Vacancy"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      vacancySchema,
      "Vacancy submitted for PASAK approval"
    ),
    ...jsonErrors(
      HttpStatusCodes.BAD_REQUEST,
      HttpStatusCodes.UNAUTHORIZED,
      HttpStatusCodes.FORBIDDEN
    ),
  },
});

export const updateVacancyRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Vacancies"],
  middleware: [requireCompanyPermission("vacancy", "update")],
  request: {
    params: vacancyIdParamSchema,
    body: jsonContentRequired(updateVacancyBodySchema, "Vacancy fields"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(vacancySchema, "Updated vacancy"),
    ...errorResponses,
  },
});

export const getMineVacancyRoute = createRoute({
  method: "get",
  path: "/mine/{id}",
  tags: ["Vacancies"],
  middleware: [requireActiveCompany, requirePermission("vacancy", "view")],
  request: {
    params: vacancyIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      vacancySchema,
      "Vacancy owned by the active company"
    ),
    ...jsonErrors(
      HttpStatusCodes.BAD_REQUEST,
      HttpStatusCodes.UNAUTHORIZED,
      HttpStatusCodes.NOT_FOUND
    ),
  },
});

export const resubmitVacancyRoute = createRoute({
  method: "post",
  path: "/{id}/resubmit",
  tags: ["Vacancies"],
  middleware: [requireCompanyPermission("vacancy", "resubmit")],
  request: {
    params: vacancyIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      vacancySchema,
      "Vacancy resubmitted for PASAK review"
    ),
    ...errorResponses,
  },
});

export const deleteVacancyRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Vacancies"],
  middleware: [requireCompanyPermission("vacancy", "delete")],
  request: {
    params: vacancyIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Deleted",
    },
    ...jsonErrors(
      HttpStatusCodes.UNAUTHORIZED,
      HttpStatusCodes.FORBIDDEN,
      HttpStatusCodes.NOT_FOUND
    ),
  },
});

export type ListPublicVacanciesRoute = typeof listPublicVacanciesRoute;
export type ListMineVacanciesRoute = typeof listMineVacanciesRoute;
export type GetVacancyRoute = typeof getVacancyRoute;
export type CreateVacancyRoute = typeof createVacancyRoute;
export type UpdateVacancyRoute = typeof updateVacancyRoute;
export type GetMineVacancyRoute = typeof getMineVacancyRoute;
export type ResubmitVacancyRoute = typeof resubmitVacancyRoute;
export type DeleteVacancyRoute = typeof deleteVacancyRoute;

const vacancies = createRouter()
  .openapi(listPublicVacanciesRoute, listPublicVacancies)
  .openapi(listMineVacanciesRoute, listMineVacancies)
  .openapi(getMineVacancyRoute, getMineVacancy)
  .openapi(createVacancyRoute, createVacancy)
  .openapi(resubmitVacancyRoute, resubmitVacancy)
  .openapi(getVacancyRoute, getVacancy)
  .openapi(updateVacancyRoute, updateVacancy)
  .openapi(deleteVacancyRoute, deleteVacancy);

export default vacancies;
