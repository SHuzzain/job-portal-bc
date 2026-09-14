import * as HttpStatusCodes from "stoker/http-status-codes"
import { organizationId } from "../../lib/session.ts"
import type { AppRouteHandler } from "../../lib/types.ts"
import * as applicationsService from "../applications/applications.service.ts"
import type { StaleApplicationsRoute } from "./workflows.route.ts"

export const staleApplications: AppRouteHandler<StaleApplicationsRoute> = async (c) => {
  return c.json(
    await applicationsService.markStaleForOrganization(organizationId(c)),
    HttpStatusCodes.OK,
  )
}
