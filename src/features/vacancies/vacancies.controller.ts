import * as HttpStatusCodes from "stoker/http-status-codes"
import { auth } from "../../auth/index.ts"
import type { AppRouteHandler } from "../../lib/types.ts"
import type {
  CreateVacancyRoute,
  DeleteVacancyRoute,
  GetMineVacancyRoute,
  GetVacancyRoute,
  ListMineVacanciesRoute,
  ListPublicVacanciesRoute,
  ResubmitVacancyRoute,
  UpdateVacancyRoute,
} from "./vacancies.route.ts"
import { VacancyError } from "./vacancies.service.ts"
import * as vacanciesService from "./vacancies.service.ts"

function activeOrgId(session: unknown) {
  const id = (session as { session?: { activeOrganizationId?: unknown } }).session
    ?.activeOrganizationId
  return typeof id === "string" ? id : null
}

function asVacancyError(error: unknown) {
  if (error instanceof VacancyError) {
    return error
  }
  throw error
}

export const listPublic: AppRouteHandler<ListPublicVacanciesRoute> = async (c) => {
    const query = c.req.valid("query")
    const vacancies =
      query.status && query.status !== "APPROVED"
        ? []
        : await vacanciesService.listApprovedVacancies({
            q: query.q,
            location: query.location,
            employmentType: query.employmentType,
          })
    return c.json(vacancies, HttpStatusCodes.OK)
  }

export const listMine: AppRouteHandler<ListMineVacanciesRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const organizationId = activeOrgId(session)
    if (!organizationId) {
      return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
    }

    return c.json(await vacanciesService.listOrganizationVacancies(organizationId), HttpStatusCodes.OK)
  }

export const getMine: AppRouteHandler<GetMineVacancyRoute> = async (c) => {
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
      return c.json(await vacanciesService.getOwnVacancy(organizationId, id), HttpStatusCodes.OK)
    } catch (error) {
      const mapped = asVacancyError(error)
      return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
    }
  }

export const resubmit: AppRouteHandler<ResubmitVacancyRoute> = async (c) => {
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
      return c.json(await vacanciesService.resubmitOwnVacancy(organizationId, id), HttpStatusCodes.OK)
    } catch (error) {
      const mapped = asVacancyError(error)
      if (mapped.status === HttpStatusCodes.FORBIDDEN) {
        return c.json({ message: mapped.message }, HttpStatusCodes.FORBIDDEN)
      }
      return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
    }
  }

export const get: AppRouteHandler<GetVacancyRoute> = async (c) => {
    try {
      const { id } = c.req.valid("param")
      return c.json(await vacanciesService.getPublicVacancy(id), HttpStatusCodes.OK)
    } catch (error) {
      const mapped = asVacancyError(error)
      return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
    }
  }

export const create: AppRouteHandler<CreateVacancyRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const organizationId = activeOrgId(session)
    if (!organizationId) {
      return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
    }

    const permission = await auth.api.hasPermission({
      headers: c.req.raw.headers,
      body: { permissions: { vacancy: ["create"] } },
    })

    if (!permission?.success) {
      return c.json({ message: "Missing vacancy.create permission" }, HttpStatusCodes.FORBIDDEN)
    }

    try {
      const vacancy = await vacanciesService.createVacancy(organizationId, c.req.valid("json"))
      return c.json(vacancy, HttpStatusCodes.CREATED)
    } catch (error) {
      const mapped = asVacancyError(error)
      return c.json({ message: mapped.message }, HttpStatusCodes.BAD_REQUEST)
    }
  }

export const update: AppRouteHandler<UpdateVacancyRoute> = async (c) => {
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
      const vacancy = await vacanciesService.updateOwnVacancy(
        organizationId,
        id,
        c.req.valid("json"),
      )
      return c.json(vacancy, HttpStatusCodes.OK)
    } catch (error) {
      const mapped = asVacancyError(error)
      if (mapped.status === HttpStatusCodes.FORBIDDEN) {
        return c.json({ message: mapped.message }, HttpStatusCodes.FORBIDDEN)
      }
      return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
    }
  }

export const deleteVacancy: AppRouteHandler<DeleteVacancyRoute> = async (c) => {
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
      await vacanciesService.deleteOwnVacancy(organizationId, id)
      return c.body(null, HttpStatusCodes.NO_CONTENT)
    } catch (error) {
      const mapped = asVacancyError(error)
      return c.json({ message: mapped.message }, HttpStatusCodes.NOT_FOUND)
    }
  }
