import * as HttpStatusCodes from "stoker/http-status-codes"
import { authedSession } from "../../lib/session.ts"
import type { AppRouteHandler } from "../../lib/types.ts"
import type { ResubmitCompanyRoute } from "./companies.route.ts"
import { CompanyError } from "./companies.service.ts"
import * as companiesService from "./companies.service.ts"

export const resubmitCompany: AppRouteHandler<ResubmitCompanyRoute> = async (c) => {
  const session = authedSession(c)

  try {
    const { id } = c.req.valid("param")
    return c.json(await companiesService.resubmitOwnCompany(session.user.id, id), HttpStatusCodes.OK)
  } catch (error) {
    if (error instanceof CompanyError) {
      return c.json({ message: error.message }, error.status)
    }
    throw error
  }
}
