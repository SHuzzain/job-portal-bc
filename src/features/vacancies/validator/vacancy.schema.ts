import { z } from "@hono/zod-openapi"

export const vacancyStatusSchema = z
  .enum(["PENDING_APPROVAL", "APPROVED", "RETURNED_FOR_CORRECTION", "REJECTED", "CLOSED"])
  .openapi("VacancyStatus")

export const vacancyEmploymentTypeSchema = z
  .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"])
  .openapi("VacancyEmploymentType")

export const vacancySchema = z
  .object({
    id: z.string(),
    organizationId: z.string(),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    employmentType: vacancyEmploymentTypeSchema,
    minQualification: z.string().nullable(),
    preferredGender: z.string().nullable(),
    minAge: z.number().int().nullable(),
    maxAge: z.number().int().nullable(),
    status: vacancyStatusSchema,
    reviewNotes: z.string().nullable(),
    createdAt: z.string(),
  })
  .openapi("Vacancy")

export const createVacancyBodySchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(8000),
    location: z.string().min(1).max(200),
    employmentType: vacancyEmploymentTypeSchema,
    minQualification: z.string().max(120).optional(),
    preferredGender: z.enum(["MALE", "FEMALE"]).optional(),
    minAge: z.number().int().min(16).max(80).optional(),
    maxAge: z.number().int().min(16).max(80).optional(),
  })
  .openapi("CreateVacancyBody")

export const updateVacancyBodySchema = createVacancyBodySchema.partial().openapi("UpdateVacancyBody")

export const listVacanciesQuerySchema = z
  .object({
    status: vacancyStatusSchema.optional(),
    q: z.string().optional(),
    location: z.string().optional(),
    employmentType: vacancyEmploymentTypeSchema.optional(),
  })
  .openapi("ListVacanciesQuery")

export const vacancyIdParamSchema = z
  .object({
    id: z.string().min(1),
  })
  .openapi("VacancyIdParam")
