import * as HttpStatusCodes from "stoker/http-status-codes"
import { start } from "workflow/api"
import { activeOrganizationId, authedSession, organizationId } from "../../lib/session.ts"
import type { AppRouteHandler } from "../../lib/types.ts"
import { staleApplicationWorkflow } from "../../workflows/stale-application.workflow.ts"
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

function mapError(error: unknown) {
  if (error instanceof ApplicationError) {
    return error
  }
  throw error
}

export const create: AppRouteHandler<CreateApplicationRoute> = async (c) => {
  const session = authedSession(c)

  try {
    const body = c.req.valid("json")
    const application = await applicationsService.apply(
      session.user.id,
      body.vacancyId,
      body.resumeId,
    )
    await start(staleApplicationWorkflow, [{ applicationId: application.id }])
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
  const session = authedSession(c)
  return c.json(await applicationsService.listMine(session.user.id), HttpStatusCodes.OK)
}

export const listForVacancy: AppRouteHandler<ListForVacancyRoute> = async (c) => {
  try {
    const { vacancyId } = c.req.valid("param")
    return c.json(
      await applicationsService.listForVacancy(organizationId(c), vacancyId),
      HttpStatusCodes.OK,
    )
  } catch (error) {
    const mapped = mapError(error)
    return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
  }
}

export const get: AppRouteHandler<GetApplicationRoute> = async (c) => {
  const session = authedSession(c)

  try {
    const { id } = c.req.valid("param")
    return c.json(
      await applicationsService.getVisibleApplication(
        session.user.id,
        activeOrganizationId(session),
        id,
      ),
      HttpStatusCodes.OK,
    )
  } catch (error) {
    const mapped = mapError(error)
    return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
  }
}

export const setStatus: AppRouteHandler<SetStatusRoute> = async (c) => {
  try {
    const { id } = c.req.valid("param")
    const { status } = c.req.valid("json")
    return c.json(await applicationsService.setStatus(organizationId(c), id, status), HttpStatusCodes.OK)
  } catch (error) {
    const mapped = mapError(error)
    if (mapped.status === HttpStatusCodes.BAD_REQUEST) {
      return c.json({ message: mapped.message }, HttpStatusCodes.BAD_REQUEST)
    }
    return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
  }
}

export const followUp: AppRouteHandler<FollowUpRoute> = async (c) => {
  try {
    const { id } = c.req.valid("param")
    return c.json(await applicationsService.requestFollowUp(organizationId(c), id), HttpStatusCodes.OK)
  } catch (error) {
    const mapped = mapError(error)
    return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
  }
}
