import * as HttpStatusCodes from "stoker/http-status-codes"
import { effectiveWorkspace } from "../../auth/access/workspace.ts"
import { authedSession } from "../../lib/session.ts"
import type { AppRouteHandler } from "../../lib/types.ts"
import type {
  UpdateMeRoute,
  UpdatePhoneRoute,
  UpdateWorkspaceRoute,
} from "./users.route.ts"
import { WorkspaceError } from "./users.service.ts"
import * as usersService from "./users.service.ts"

function toProfile(user: {
  id: string
  name: string
  email: string
  image: string | null
  phoneNumber: string | null
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    phoneNumber: user.phoneNumber,
  }
}

export const updateMe: AppRouteHandler<UpdateMeRoute> = async (c) => {
    const session = authedSession(c)

    const body = c.req.valid("json")
    const user = await usersService.updateProfile(session.user.id, body)
    if (!user) {
      return c.json({ message: "User not found" }, HttpStatusCodes.NOT_FOUND)
    }

    return c.json(toProfile(user), HttpStatusCodes.OK)
  }

export const updatePhone: AppRouteHandler<UpdatePhoneRoute> = async (c) => {
    const session = authedSession(c)

    const { phoneNumber } = c.req.valid("json")
    const user = await usersService.updatePhone(session.user.id, phoneNumber)
    if (!user) {
      return c.json({ message: "User not found" }, HttpStatusCodes.NOT_FOUND)
    }

    return c.json(toProfile(user), HttpStatusCodes.OK)
  }

export const updateWorkspace: AppRouteHandler<UpdateWorkspaceRoute> = async (c) => {
  const session = authedSession(c)

  try {
    const user = await usersService.updateWorkspace(
      session.user.id,
      c.req.valid("json").workspace,
    )
    return c.json(
      {
        workspace: effectiveWorkspace(user),
        hasTvetCapability: user.hasTvetCapability === true,
      },
      HttpStatusCodes.OK,
    )
  } catch (error) {
    if (error instanceof WorkspaceError) {
      return c.json({ message: error.message }, error.status)
    }
    throw error
  }
}
