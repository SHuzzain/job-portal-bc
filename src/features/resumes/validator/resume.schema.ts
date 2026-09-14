import { z } from "@hono/zod-openapi"

export const resumeSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    fileUrl: z.string(),
    createdAt: z.string(),
  })
  .openapi("Resume")

export const createResumeBodySchema = z
  .object({
    title: z.string().min(1).max(200),
    fileUrl: z.url(),
  })
  .openapi("CreateResumeBody")

export const resumeIdParamSchema = z
  .object({
    id: z.string().min(1),
  })
  .openapi("ResumeIdParam")
