import { z } from "@hono/zod-openapi";

export const claimStatusSchema = z
  .enum([
    "SUBMITTED",
    "FINANCE_APPROVED",
    "SIGNED_DOC_SUBMITTED",
    "PAID",
    "REJECTED",
  ])
  .openapi("TvetClaimStatus");

const moneySchema = z
  .string()
  .regex(
    /^(?:0|[1-9]\d{0,9})\.\d{2}$/,
    "Use a positive amount with two decimals"
  )
  .refine(
    (value) => value !== "0.00",
    "Claim amount must be greater than zero"
  );

export const tvetClaimSchema = z
  .object({
    id: z.string(),
    courseId: z.string(),
    employerId: z.string(),
    claimAmount: z.string(),
    borangTuntutanUrl: z.string(),
    status: claimStatusSchema,
    signedBorangAkuanUrl: z.string().nullable(),
    reviewNotes: z.string().nullable(),
    reviewedAt: z.string().nullable(),
    paidAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    courseTitle: z.string(),
    courseStartsAt: z.string(),
    courseEndsAt: z.string(),
    providerName: z.string(),
    paymentVoucherDownloadUrl: z.string(),
    borangAkuanDownloadUrl: z.string(),
  })
  .openapi("TvetClaim");

export const eligibleCourseSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    venue: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
  })
  .openapi("TvetClaimEligibleCourse");

export const claimIdParamSchema = z
  .object({ id: z.string().min(1) })
  .openapi("TvetClaimIdParam");

export const submitClaimBodySchema = z
  .object({
    courseId: z.string().min(1),
    claimAmount: moneySchema,
    borangTuntutanUrl: z.url(),
  })
  .openapi("SubmitTvetClaimBody");

export const uploadSignedClaimBodySchema = z
  .object({ signedBorangAkuanUrl: z.url() })
  .openapi("UploadSignedTvetClaimBody");

export const reviewClaimBodySchema = z
  .object({
    action: z.enum(["APPROVE", "REJECT"]),
    comments: z.string().trim().max(4000).optional(),
  })
  .refine((data) => data.action !== "REJECT" || Boolean(data.comments), {
    message: "Comments are required when rejecting a claim",
    path: ["comments"],
  })
  .openapi("ReviewTvetClaimBody");
