import * as HttpStatusCodes from "stoker/http-status-codes"
import { authedSession } from "../../lib/session.ts"
import type { AppRouteHandler } from "../../lib/types.ts"
import type { GetMineRoute, UpdateMineRoute } from "./seeker-profiles.route.ts"
import * as seekerProfilesService from "./seeker-profiles.service.ts"

export const getMine: AppRouteHandler<GetMineRoute> = async (c) => {
    const session = authedSession(c)

    return c.json(await seekerProfilesService.getOrCreateMine(session.user.id), HttpStatusCodes.OK)
  }

export const updateMine: AppRouteHandler<UpdateMineRoute> = async (c) => {
    const session = authedSession(c)

    return c.json(
      await seekerProfilesService.updateMine(session.user.id, c.req.valid("json")),
      HttpStatusCodes.OK,
    )
  }
