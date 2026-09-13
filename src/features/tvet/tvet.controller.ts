import * as HttpStatusCodes from "stoker/http-status-codes"
import type { AppRouteHandler } from "../../lib/types.ts"
import type {
  CreateRfpRoute,
  CreateSessionRoute,
  GetSessionRoute,
  ListMyAttendanceRoute,
  ListRfpsRoute,
  ListSessionsRoute,
  ScanRoute,
  UpdateRfpRoute,
} from "./tvet.route.ts"
import { TvetError } from "./tvet.service.ts"
import * as tvetService from "./tvet.service.ts"

function activeOrgId(session: unknown) {
  const id = (session as { session?: { activeOrganizationId?: unknown } }).session
    ?.activeOrganizationId
  return typeof id === "string" ? id : null
}

function mapError(error: unknown) {
  if (error instanceof TvetError) {
    return error
  }
  throw error
}

export const listRfps: AppRouteHandler<ListRfpsRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const organizationId = activeOrgId(session)
    if (!organizationId) {
      return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
    }

    return c.json(await tvetService.listRfps(organizationId), HttpStatusCodes.OK)
  }

export const createRfp: AppRouteHandler<CreateRfpRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const organizationId = activeOrgId(session)
    if (!organizationId) {
      return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
    }

    try {
      return c.json(
        await tvetService.createRfp(organizationId, c.req.valid("json")),
        HttpStatusCodes.CREATED,
      )
    } catch (error) {
      const mapped = mapError(error)
      return c.json({ message: mapped.message }, mapped.status)
    }
  }

export const updateRfp: AppRouteHandler<UpdateRfpRoute> = async (c) => {
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
      return c.json(
        await tvetService.updateRfp(organizationId, id, c.req.valid("json")),
        HttpStatusCodes.OK,
      )
    } catch (error) {
      const mapped = mapError(error)
      return c.json({ message: mapped.message }, mapped.status)
    }
  }

export const listSessions: AppRouteHandler<ListSessionsRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const organizationId = activeOrgId(session)
    if (!organizationId) {
      return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
    }

    const { rfpId } = c.req.valid("query")
    return c.json(await tvetService.listSessions(organizationId, rfpId), HttpStatusCodes.OK)
  }

export const createSession: AppRouteHandler<CreateSessionRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const organizationId = activeOrgId(session)
    if (!organizationId) {
      return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
    }

    try {
      return c.json(
        await tvetService.createSession(organizationId, c.req.valid("json")),
        HttpStatusCodes.CREATED,
      )
    } catch (error) {
      const mapped = mapError(error)
      return c.json({ message: mapped.message }, mapped.status)
    }
  }

export const getSession: AppRouteHandler<GetSessionRoute> = async (c) => {
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
      return c.json(await tvetService.getSession(organizationId, id), HttpStatusCodes.OK)
    } catch (error) {
      const mapped = mapError(error)
      return c.json({ message: mapped.message }, mapped.status)
    }
  }

export const scan: AppRouteHandler<ScanRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    try {
      return c.json(
        await tvetService.scan(session.user.id, c.req.valid("json").barcode),
        HttpStatusCodes.CREATED,
      )
    } catch (error) {
      const mapped = mapError(error)
      return c.json({ message: mapped.message }, mapped.status)
    }
  }

export const listMyAttendance: AppRouteHandler<ListMyAttendanceRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    return c.json(await tvetService.listMyAttendance(session.user.id), HttpStatusCodes.OK)
  }
