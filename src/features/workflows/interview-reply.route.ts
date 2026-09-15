import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { createRouter } from "../../lib/create-app.ts";
import { errorMessageSchema, jsonErrors } from "../../lib/http-errors.ts";
import { interviewReplyWebhook } from "./interview-reply.controller.ts";
import {
  interviewReplyBodySchema,
  interviewReplyHeadersSchema,
  interviewReplyResultSchema,
} from "./validator/interview-reply.schema.ts";

export const interviewReplyWebhookRoute = createRoute({
  method: "post",
  path: "/interview-reply",
  tags: ["Workflow webhooks"],
  request: {
    headers: interviewReplyHeadersSchema,
    body: jsonContentRequired(interviewReplyBodySchema, "Interview reply"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      interviewReplyResultSchema,
      "Workflow resumed"
    ),
    ...jsonErrors(
      HttpStatusCodes.BAD_REQUEST,
      HttpStatusCodes.UNAUTHORIZED,
      HttpStatusCodes.NOT_FOUND
    ),
    [HttpStatusCodes.SERVICE_UNAVAILABLE]: jsonContent(
      errorMessageSchema,
      "Webhook secret is not configured"
    ),
  },
});

export type InterviewReplyWebhookRoute = typeof interviewReplyWebhookRoute;

const interviewReplyWebhooks = createRouter().openapi(
  interviewReplyWebhookRoute,
  interviewReplyWebhook
);

export default interviewReplyWebhooks;
