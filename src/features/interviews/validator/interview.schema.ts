import { z } from "@hono/zod-openapi"

export const interviewModeSchema = z.enum(["PHYSICAL", "ONLINE"]).openapi("InterviewMode")

export const interviewStatusSchema = z
  .enum(["SCHEDULED", "CONFIRMED", "CANCELLED", "COMPLETED"])
  .openapi("InterviewStatus")

export const interviewSchema = z
  .object({
    id: z.string(),
    applicationId: z.string(),
    interviewDate: z.string(),
    interviewTime: z.string(),
    mode: interviewModeSchema,
    location: z.string().nullable(),
    meetingLink: z.string().nullable(),
    notes: z.string().nullable(),
    status: interviewStatusSchema,
    createdAt: z.string(),
  })
  .openapi("Interview")

export const scheduleInterviewBodySchema = z
  .object({
    applicationId: z.string().min(1),
    interviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    interviewTime: z.string().min(1).max(32),
    mode: interviewModeSchema,
    location: z.string().max(500).optional(),
    meetingLink: z.url().optional(),
    notes: z.string().max(4000).optional(),
  })
  .refine((data) => data.mode !== "PHYSICAL" || Boolean(data.location?.trim()), {
    message: "Location is required for physical interviews",
    path: ["location"],
  })
  .refine((data) => data.mode !== "ONLINE" || Boolean(data.meetingLink?.trim()), {
    message: "Meeting link is required for online interviews",
    path: ["meetingLink"],
  })
  .openapi("ScheduleInterviewBody")

export const applicationIdParamSchema = z
  .object({
    applicationId: z.string().min(1),
  })
  .openapi("InterviewApplicationIdParam")
