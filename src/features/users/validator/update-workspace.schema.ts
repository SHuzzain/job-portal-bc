import { z } from "@hono/zod-openapi"

export const updateWorkspaceBodySchema = z
  .object({
    workspace: z.enum(["employer", "training_provider"]).openapi({
      example: "training_provider",
    }),
  })
  .openapi("UpdateWorkspaceBody")

export const updateWorkspaceResponseSchema = z
  .object({
    workspace: z.enum(["employer", "training_provider"]),
    hasTvetCapability: z.boolean(),
  })
  .openapi("UserWorkspace")
