import { interviewSchema } from "../../interviews/validator/interview.schema.ts"
import { z } from "@hono/zod-openapi"

export const applicationStatusSchema = z
  .enum([
    "SUBMITTED",
    "REVIEWING",
    "SHORTLISTED",
    "WAITING_FOR_INTERVIEW",
    "INTERVIEW_COMPLETED",
    "HIRED",
    "REJECTED",
    "FAILED",
  ])
  .openapi("ApplicationStatus")

export const applicationSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    vacancyId: z.string(),
    resumeId: z.string(),
    status: z.string(),
    createdAt: z.string(),
    interview: interviewSchema.nullable(),
  })
  .openapi("Application")

export const createApplicationBodySchema = z
  .object({
    vacancyId: z.string().min(1),
    resumeId: z.string().min(1),
  })
  .openapi("CreateApplicationBody")

export const vacancyIdParamSchema = z
  .object({
    vacancyId: z.string().min(1),
  })
  .openapi("ApplicationVacancyIdParam")

export const applicationIdParamSchema = z
  .object({
    id: z.string().min(1),
  })
  .openapi("ApplicationIdParam")

export const employerApplicationStatusSchema = z
  .enum(["SHORTLISTED", "INTERVIEW_COMPLETED", "REJECTED", "HIRED", "FAILED"])
  .openapi("ApplicationWorkflowStatus")

export const setApplicationStatusBodySchema = z
  .object({
    status: employerApplicationStatusSchema,
  })
  .openapi("SetApplicationStatusBody")

export const staleSweepResultSchema = z
  .object({
    marked: z.number().int(),
  })
  .openapi("StaleSweepResult")
