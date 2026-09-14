import { z } from "@hono/zod-openapi"
import { vacancySchema } from "../../vacancies/validator/vacancy.schema.ts"

export const companyStatusSchema = z
  .enum(["PENDING_APPROVAL", "APPROVED", "RETURNED_FOR_CORRECTION", "REJECTED"])
  .openapi("CompanyStatus")

export const companySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    status: companyStatusSchema,
    ssmNumber: z.string().nullable(),
    ssmDocumentUrl: z.string().nullable(),
    legalName: z.string().nullable(),
    industry: z.string().nullable(),
    website: z.string().nullable(),
    address: z.string().nullable(),
    reviewNotes: z.string().nullable(),
  })
  .openapi("PasakCompany")

export const listCompaniesQuerySchema = z
  .object({
    status: companyStatusSchema.optional(),
  })
  .openapi("ListPasakCompaniesQuery")

export const listPasakVacanciesQuerySchema = z
  .object({
    status: z
      .enum(["PENDING_APPROVAL", "APPROVED", "RETURNED_FOR_CORRECTION", "REJECTED", "CLOSED"])
      .optional(),
  })
  .openapi("ListPasakVacanciesQuery")

export const companyIdParamSchema = z
  .object({
    id: z.string().min(1),
  })
  .openapi("PasakCompanyIdParam")

export const vacancyIdParamSchema = z
  .object({
    id: z.string().min(1),
  })
  .openapi("PasakVacancyIdParam")

export const setCompanyStatusBodySchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
  })
  .openapi("SetCompanyStatusBody")

export const setVacancyStatusBodySchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
  })
  .openapi("SetVacancyStatusBody")

export const employerIdParamSchema = z
  .object({
    id: z.string().min(1),
  })
  .openapi("PasakEmployerIdParam")

export const pasakEmployerSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    hasTvetCapability: z.boolean(),
  })
  .openapi("PasakEmployer")

export const reviewActionSchema = z
  .enum(["APPROVE", "REJECT", "RETURN_FOR_CORRECTION"])
  .openapi("PasakReviewAction")

export const reviewBodySchema = z
  .object({
    action: reviewActionSchema,
    comments: z.string().optional(),
  })
  .refine(
    (data) => data.action !== "RETURN_FOR_CORRECTION" || Boolean(data.comments?.trim()),
    { message: "Comments are required when returning for correction", path: ["comments"] },
  )
  .openapi("PasakReviewBody")

export const setTvetCapabilityBodySchema = z
  .object({
    hasTvetCapability: z.boolean(),
  })
  .openapi("SetTvetCapabilityBody")

export const vacancyListSchema = vacancySchema.array()
