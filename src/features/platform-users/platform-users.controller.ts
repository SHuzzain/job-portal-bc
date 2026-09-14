import * as HttpStatusCodes from "stoker/http-status-codes"
import type { AppRouteHandler } from "../../lib/types.ts"
import type {
  AssignPlatformRoleRoute,
  CreatePlatformUserRoute,
  ListPlatformUsersRoute,
  UpdatePlatformUserRoute,
} from "./platform-users.route.ts"
import { PlatformUserError } from "./platform-users.service.ts"
import * as service from "./platform-users.service.ts"

function handled(error: unknown) {
  return error instanceof PlatformUserError
    ? ({ message: error.message, status: error.status } as const)
    : null
}

export const listPlatformUsers: AppRouteHandler<ListPlatformUsersRoute> = async (c) => {
  return c.json(await service.listUsers(), HttpStatusCodes.OK)
}

export const createPlatformUser: AppRouteHandler<CreatePlatformUserRoute> = async (c) => {
  try {
    return c.json(await service.createUser(c.req.valid("json")), HttpStatusCodes.CREATED)
  } catch (error) {
    const mapped = handled(error)
    if (mapped) {
      return c.json({ message: mapped.message }, mapped.status)
    }
    throw error
  }
}

export const assignPlatformRole: AppRouteHandler<AssignPlatformRoleRoute> = async (c) => {
  try {
    return c.json(
      await service.assignRole(c.req.valid("param").id, c.req.valid("json").role),
      HttpStatusCodes.OK,
    )
  } catch (error) {
    const mapped = handled(error)
    if (mapped) {
      return c.json({ message: mapped.message }, mapped.status)
    }
    throw error
  }
}

export const updatePlatformUser: AppRouteHandler<UpdatePlatformUserRoute> = async (c) => {
  try {
    return c.json(
      await service.updateUser(c.req.valid("param").id, c.req.valid("json")),
      HttpStatusCodes.OK,
    )
  } catch (error) {
    const mapped = handled(error)
    if (mapped) {
      return c.json({ message: mapped.message }, mapped.status)
    }
    throw error
  }
}
