import { z } from "@hono/zod-openapi";

export const updatePhoneBodySchema = z
  .object({
    phoneNumber: z.string().min(5).max(32).openapi({ example: "+15551234567" }),
  })
  .openapi("UpdatePhoneBody");
