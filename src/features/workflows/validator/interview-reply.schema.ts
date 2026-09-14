import { z } from "@hono/zod-openapi"

export const interviewReplyBodySchema = z
  .object({
    applicationId: z.string().min(1),
    response: z.enum(["confirm", "decline"]),
  })
  .openapi("InterviewReplyBody")

export const interviewReplyHeadersSchema = z.object({
  "x-webhook-secret": z.string().min(1),
})

export const interviewReplyResultSchema = z
  .object({
    success: z.literal(true),
    runId: z.string(),
  })
  .openapi("InterviewReplyResult")
