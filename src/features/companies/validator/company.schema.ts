import { z } from "@hono/zod-openapi"
import { companySchema } from "../../pasak/validator/pasak.schema.ts"

export const companyIdParamSchema = z
  .object({
    id: z.string().min(1),
  })
  .openapi("CompanyIdParam")

export const errorMessageSchema = z.object({ message: z.string() }).openapi("CompanyErrorMessage")

export { companySchema }
