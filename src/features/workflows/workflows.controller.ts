import * as HttpStatusCodes from "stoker/http-status-codes"
import type { AppRouteHandler } from "../../lib/types.ts"
import * as applicationsService from "../applications/applications.service.ts"
import type { StaleApplicationsRoute } from "./workflows.route.ts"

function activeOrgId(session: unknown) {
  const id = (session as { session?: { activeOrganizationId?: unknown } }).session
    ?.activeOrganizationId
  return typeof id === "string" ? id : null
}

export const staleApplications: AppRouteHandler<StaleApplicationsRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const organizationId = activeOrgId(session)
    if (!organizationId) {
      return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
    }

    return c.json(
      await applicationsService.markStaleForOrganization(organizationId),
      HttpStatusCodes.OK,
    )
  }
