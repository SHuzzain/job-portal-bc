import * as HttpStatusCodes from "stoker/http-status-codes"
import type { AppRouteHandler } from "../../lib/types.ts"
import type {
  CreateApplicationRoute,
  FollowUpRoute,
  GetApplicationRoute,
  ListForVacancyRoute,
  ListMineRoute,
  SetStatusRoute,
} from "./applications.route.ts"
import { ApplicationError } from "./applications.service.ts"
import * as applicationsService from "./applications.service.ts"

function activeOrgId(session: unknown) {
  const id = (session as { session?: { activeOrganizationId?: unknown } }).session
    ?.activeOrganizationId
  return typeof id === "string" ? id : null
}

function mapError(error: unknown) {
  if (error instanceof ApplicationError) {
    return error
  }
  throw error
}

export const create: AppRouteHandler<CreateApplicationRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    try {
      const body = c.req.valid("json")
      const application = await applicationsService.apply(
        session.user.id,
        body.vacancyId,
        body.resumeId,
      )
      return c.json(application, HttpStatusCodes.CREATED)
    } catch (error) {
      const mapped = mapError(error)
      if (mapped.status === HttpStatusCodes.CONFLICT) {
        return c.json({ message: mapped.message }, HttpStatusCodes.CONFLICT)
      }
      if (mapped.status === HttpStatusCodes.NOT_FOUND) {
        return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
      }
      if (mapped.status === HttpStatusCodes.FORBIDDEN) {
        return c.json({ message: mapped.message }, HttpStatusCodes.FORBIDDEN)
      }
      return c.json({ message: mapped.message }, HttpStatusCodes.BAD_REQUEST)
    }
  }

export const listMine: AppRouteHandler<ListMineRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }
    return c.json(await applicationsService.listMine(session.user.id), HttpStatusCodes.OK)
  }

export const listForVacancy: AppRouteHandler<ListForVacancyRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const organizationId = activeOrgId(session)
    if (!organizationId) {
      return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
    }

    try {
      const { vacancyId } = c.req.valid("param")
      return c.json(
        await applicationsService.listForVacancy(organizationId, vacancyId),
        HttpStatusCodes.OK,
      )
    } catch (error) {
      const mapped = mapError(error)
      return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
    }
  }

export const get: AppRouteHandler<GetApplicationRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    try {
      const { id } = c.req.valid("param")
      return c.json(
        await applicationsService.getVisibleApplication(session.user.id, activeOrgId(session), id),
        HttpStatusCodes.OK,
      )
    } catch (error) {
      const mapped = mapError(error)
      return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
    }
  }

export const setStatus: AppRouteHandler<SetStatusRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const organizationId = activeOrgId(session)
    if (!organizationId) {
      return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
    }

    try {
      const { id } = c.req.valid("param")
      const { status } = c.req.valid("json")
      return c.json(
        await applicationsService.setStatus(organizationId, id, status),
        HttpStatusCodes.OK,
      )
    } catch (error) {
      const mapped = mapError(error)
      if (mapped.status === HttpStatusCodes.BAD_REQUEST) {
        return c.json({ message: mapped.message }, HttpStatusCodes.BAD_REQUEST)
      }
      return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
    }
  }

export const followUp: AppRouteHandler<FollowUpRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const organizationId = activeOrgId(session)
    if (!organizationId) {
      return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
    }

    try {
      const { id } = c.req.valid("param")
      return c.json(await applicationsService.requestFollowUp(organizationId, id), HttpStatusCodes.OK)
    } catch (error) {
      const mapped = mapError(error)
      return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
    }
  }
