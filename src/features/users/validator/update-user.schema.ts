import { z } from "@hono/zod-openapi"

export const updateUserBodySchema = z
  .object({
    name: z.string().min(1).max(255).optional().openapi({ example: "Ada Lovelace" }),
    image: z
      .url()
      .nullable()
      .optional()
      .openapi({ example: "https://example.com/avatar.png" }),
  })
  .openapi("UpdateUserBody")

export const updateUserResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    image: z.string().nullable(),
    phoneNumber: z.string().nullable(),
  })
  .openapi("UserProfile")
