import { z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent } from "stoker/openapi/helpers"

export const errorMessageSchema = z
  .object({
    message: z.string(),
  })
  .openapi("ErrorMessage")

export const errorResponses = {
  [HttpStatusCodes.BAD_REQUEST]: jsonContent(errorMessageSchema, "Bad request"),
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(errorMessageSchema, "Unauthorized"),
  [HttpStatusCodes.FORBIDDEN]: jsonContent(errorMessageSchema, "Forbidden"),
  [HttpStatusCodes.NOT_FOUND]: jsonContent(errorMessageSchema, "Not found"),
  [HttpStatusCodes.CONFLICT]: jsonContent(errorMessageSchema, "Conflict"),
} as const

export function jsonErrors<K extends keyof typeof errorResponses>(...codes: K[]) {
  return Object.fromEntries(codes.map((code) => [code, errorResponses[code]])) as Pick<
    typeof errorResponses,
    K
  >
}
