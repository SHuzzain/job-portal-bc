import * as HttpStatusCodes from "stoker/http-status-codes"
import type { AppRouteHandler } from "../../lib/types.ts"
import type { UpdateMeRoute, UpdatePhoneRoute } from "./users.route.ts"
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
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const body = c.req.valid("json")
    const user = await usersService.updateProfile(session.user.id, body)
    if (!user) {
      return c.json({ message: "User not found" }, HttpStatusCodes.NOT_FOUND)
    }

    return c.json(toProfile(user), HttpStatusCodes.OK)
  }

export const updatePhone: AppRouteHandler<UpdatePhoneRoute> = async (c) => {
    const session = c.get("session")
    if (!session) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED)
    }

    const { phoneNumber } = c.req.valid("json")
    const user = await usersService.updatePhone(session.user.id, phoneNumber)
    if (!user) {
      return c.json({ message: "User not found" }, HttpStatusCodes.NOT_FOUND)
    }

    return c.json(toProfile(user), HttpStatusCodes.OK)
  }
