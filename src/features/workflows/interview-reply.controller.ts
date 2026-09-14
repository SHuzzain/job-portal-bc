import { createHash, timingSafeEqual } from "node:crypto"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { resumeHook } from "workflow/api"
import { HookNotFoundError } from "workflow/errors"
import { env } from "../../env.ts"
import type { AppRouteHandler } from "../../lib/types.ts"
import type { InterviewReplyWebhookRoute } from "./interview-reply.route.ts"

function secretsMatch(provided: string, expected: string) {
  const providedDigest = createHash("sha256").update(provided).digest()
  const expectedDigest = createHash("sha256").update(expected).digest()
  return timingSafeEqual(providedDigest, expectedDigest)
}

export const interviewReplyWebhook: AppRouteHandler<InterviewReplyWebhookRoute> = async (c) => {
  if (!env.INTERVIEW_REPLY_WEBHOOK_SECRET) {
    return c.json(
      { message: "Interview reply webhook is not configured" },
      HttpStatusCodes.SERVICE_UNAVAILABLE,
    )
  }

  const providedSecret = c.req.valid("header")["x-webhook-secret"]
  if (!secretsMatch(providedSecret, env.INTERVIEW_REPLY_WEBHOOK_SECRET)) {
    return c.json({ message: "Invalid webhook secret" }, HttpStatusCodes.UNAUTHORIZED)
  }

  const body = c.req.valid("json")
  try {
    const result = await resumeHook(`interview.reply.${body.applicationId}`, {
      response: body.response,
    })
    return c.json({ success: true as const, runId: result.runId }, HttpStatusCodes.OK)
  } catch (error) {
    if (HookNotFoundError.is(error)) {
      return c.json(
        { message: "No interview workflow is waiting for this reply" },
        HttpStatusCodes.NOT_FOUND,
      )
    }
    throw error
  }
}
