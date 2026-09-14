import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { requireJobseeker } from "../../auth/middleware.ts"
import { createRouter } from "../../lib/create-app.ts"
import { jsonErrors } from "../../lib/http-errors.ts"
import { createResume, deleteResume, listMine } from "./resumes.controller.ts"
import {
  createResumeBodySchema,
  resumeIdParamSchema,
  resumeSchema,
} from "./validator/resume.schema.ts"

export const listMineRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Resumes"],
  middleware: [requireJobseeker],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(resumeSchema.array(), "Resumes"),
    ...jsonErrors(
      HttpStatusCodes.UNAUTHORIZED,
      HttpStatusCodes.FORBIDDEN,
      HttpStatusCodes.NOT_FOUND,
    ),
  },
})

export const createResumeRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Resumes"],
  middleware: [requireJobseeker],
  request: {
    body: jsonContentRequired(createResumeBodySchema, "Resume"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(resumeSchema, "Created resume"),
    ...jsonErrors(
      HttpStatusCodes.UNAUTHORIZED,
      HttpStatusCodes.FORBIDDEN,
      HttpStatusCodes.NOT_FOUND,
    ),
  },
})

export const deleteResumeRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Resumes"],
  middleware: [requireJobseeker],
  request: {
    params: resumeIdParamSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Deleted",
    },
    ...jsonErrors(
      HttpStatusCodes.UNAUTHORIZED,
      HttpStatusCodes.FORBIDDEN,
      HttpStatusCodes.NOT_FOUND,
    ),
  },
})

export type ListMineRoute = typeof listMineRoute
export type CreateResumeRoute = typeof createResumeRoute
export type DeleteResumeRoute = typeof deleteResumeRoute

const resumes = createRouter()
  .openapi(listMineRoute, listMine)
  .openapi(createResumeRoute, createResume)
  .openapi(deleteResumeRoute, deleteResume)

export default resumes
