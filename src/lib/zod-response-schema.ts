import { z } from "@hono/zod-openapi"
import { jsonContent } from "stoker/openapi/helpers"
import type { ZodType } from "zod"

export const ResponseSchema = z.object({
  success: z.boolean(),
})

export const ErrorSchema = z.object({
  success: z.boolean(),
  error: z.unknown(),
})

export { errorMessageSchema } from "./http-errors.ts"

export const JsonPayloadResponse = <T extends ZodType>(schema: T, description: string) =>
  jsonContent(
    z.object({
      payload: schema,
      success: z.boolean(),
    }),
    description,
  )
