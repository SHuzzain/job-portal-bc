import * as HttpStatusCodes from "stoker/http-status-codes"
import { authedSession } from "../../lib/session.ts"
import type { AppRouteHandler } from "../../lib/types.ts"
import type { CreateResumeRoute, DeleteResumeRoute, ListMineRoute } from "./resumes.route.ts"
import { ResumeError } from "./resumes.service.ts"
import * as resumesService from "./resumes.service.ts"

export const listMine: AppRouteHandler<ListMineRoute> = async (c) => {
    const session = authedSession(c)

    return c.json(await resumesService.listMine(session.user.id), HttpStatusCodes.OK)
  }

export const createResume: AppRouteHandler<CreateResumeRoute> = async (c) => {
    const session = authedSession(c)

    return c.json(
      await resumesService.createMine(session.user.id, c.req.valid("json")),
      HttpStatusCodes.CREATED,
    )
  }

export const deleteResume: AppRouteHandler<DeleteResumeRoute> = async (c) => {
    const session = authedSession(c)

    try {
      await resumesService.deleteMine(session.user.id, c.req.valid("param").id)
      return c.body(null, HttpStatusCodes.NO_CONTENT)
    } catch (error) {
      if (error instanceof ResumeError) {
        return c.json({ message: error.message }, HttpStatusCodes.NOT_FOUND)
      }
      throw error
    }
  }
