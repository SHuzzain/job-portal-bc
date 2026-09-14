import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent } from "stoker/openapi/helpers"
import { requirePermission } from "../../auth/middleware.ts"
import { createRouter } from "../../lib/create-app.ts"
import { jsonErrors } from "../../lib/http-errors.ts"
import { resubmitCompany } from "./companies.controller.ts"
import { companyIdParamSchema, companySchema } from "./validator/company.schema.ts"

export const resubmitCompanyRoute = createRoute({
  method: "post",
  path: "/{id}/resubmit",
  tags: ["Companies"],
  middleware: [requirePermission("company", "resubmit")],
  request: {
    params: companyIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(companySchema, "Company resubmitted for PASAK review"),
    ...jsonErrors(
      HttpStatusCodes.UNAUTHORIZED,
      HttpStatusCodes.FORBIDDEN,
      HttpStatusCodes.NOT_FOUND,
    ),
  },
})

export type ResubmitCompanyRoute = typeof resubmitCompanyRoute

const companies = createRouter().openapi(resubmitCompanyRoute, resubmitCompany)

export default companies
