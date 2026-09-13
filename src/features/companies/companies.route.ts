import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent } from "stoker/openapi/helpers"
import { createRouter } from "../../lib/create-app.ts"
import { resubmitCompany } from "./companies.controller.ts"
import { companyIdParamSchema, companySchema, errorMessageSchema } from "./validator/company.schema.ts"

const error = {
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(errorMessageSchema, "Unauthorized"),
  [HttpStatusCodes.FORBIDDEN]: jsonContent(errorMessageSchema, "Forbidden"),
  [HttpStatusCodes.NOT_FOUND]: jsonContent(errorMessageSchema, "Not found"),
}

export const resubmitCompanyRoute = createRoute({
  method: "post",
  path: "/{id}/resubmit",
  tags: ["Companies"],
  request: {
    params: companyIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(companySchema, "Company resubmitted for PASAK review"),
    ...error,
  },
})

export type ResubmitCompanyRoute = typeof resubmitCompanyRoute

const companies = createRouter().openapi(resubmitCompanyRoute, resubmitCompany)

export default companies
