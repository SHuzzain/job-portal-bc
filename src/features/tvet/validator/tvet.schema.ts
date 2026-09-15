import { z } from "@hono/zod-openapi";

export const rfpStatusSchema = z
  .enum(["OPEN", "CLOSED"])
  .openapi("TvetRfpStatus");

export const tvetRfpSchema = z
  .object({
    id: z.string(),
    organizationId: z.string(),
    title: z.string(),
    description: z.string(),
    status: rfpStatusSchema,
    createdAt: z.string(),
  })
  .openapi("TvetRfp");

export const createRfpBodySchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(8000),
  })
  .openapi("CreateTvetRfpBody");

export const updateRfpBodySchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(8000).optional(),
    status: rfpStatusSchema.optional(),
  })
  .openapi("UpdateTvetRfpBody");

export const tvetAttendanceSchema = z
  .object({
    id: z.string(),
    sessionId: z.string(),
    userId: z.string(),
    sessionTitle: z.string(),
    attendanceRecordedAt: z.string(),
    surveyCompletedAt: z.string().nullable(),
    certificateCode: z.string().nullable(),
    surveyRating: z.number().int().min(1).max(5).nullable(),
    surveyFeedback: z.string().nullable(),
    createdAt: z.string(),
  })
  .openapi("TvetAttendance");

export const submitSurveyBodySchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    feedback: z.string().trim().max(4000).optional(),
  })
  .openapi("SubmitTvetSurveyBody");

export const tvetCertificateSchema = z
  .object({
    sessionId: z.string(),
    recipientName: z.string(),
    courseTitle: z.string(),
    providerName: z.string(),
    venue: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    attendanceRecordedAt: z.string(),
    surveyCompletedAt: z.string(),
    certificateCode: z.string(),
    downloadAuthorized: z.literal(true),
    downloadUrl: z.string(),
  })
  .openapi("TvetCertificate");

export const tvetSessionSchema = z
  .object({
    id: z.string(),
    rfpId: z.string(),
    organizationId: z.string(),
    title: z.string(),
    venue: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    barcode: z.string(),
    createdAt: z.string(),
  })
  .openapi("TvetSession");

export const tvetSessionDetailSchema = tvetSessionSchema
  .extend({
    attendance: tvetAttendanceSchema.array(),
  })
  .openapi("TvetSessionDetail");

export const createSessionBodySchema = z
  .object({
    rfpId: z.string().min(1),
    title: z.string().min(1).max(200),
    venue: z.string().min(1).max(200),
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
  })
  .openapi("CreateTvetSessionBody");

export const listSessionsQuerySchema = z
  .object({
    rfpId: z.string().optional(),
  })
  .openapi("ListTvetSessionsQuery");

export const tvetIdParamSchema = z
  .object({
    id: z.string().min(1),
  })
  .openapi("TvetIdParam");

export const scanBodySchema = z
  .object({
    barcode: z.string().min(1).max(80),
  })
  .openapi("TvetScanBody");
