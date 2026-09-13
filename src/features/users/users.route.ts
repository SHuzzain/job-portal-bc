import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createRouter } from "../../lib/create-app.ts"
import { updateMe, updatePhone } from "./users.controller.ts"
import { updatePhoneBodySchema } from "./validator/update-phone.schema.ts"
import {
  updateUserBodySchema,
  updateUserResponseSchema,
} from "./validator/update-user.schema.ts"

const errorSchema = z.object({ message: z.string() }).openapi("ErrorMessage")

const unauthorized = {
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(errorSchema, "Missing or invalid session"),
  [HttpStatusCodes.NOT_FOUND]: jsonContent(errorSchema, "User not found"),
}

export const updateMeRoute = createRoute({
  method: "patch",
  path: "/me",
  tags: ["Users"],
  request: {
    body: jsonContentRequired(updateUserBodySchema, "Profile fields"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(updateUserResponseSchema, "Updated profile"),
    ...unauthorized,
  },
})

export const updatePhoneRoute = createRoute({
  method: "patch",
  path: "/me/phone",
  tags: ["Users"],
  request: {
    body: jsonContentRequired(updatePhoneBodySchema, "Phone number"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(updateUserResponseSchema, "Updated phone number"),
    ...unauthorized,
  },
})

export type UpdateMeRoute = typeof updateMeRoute
export type UpdatePhoneRoute = typeof updatePhoneRoute

const users = createRouter()
  .openapi(updateMeRoute, updateMe)
  .openapi(updatePhoneRoute, updatePhone)

export default users
