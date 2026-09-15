import { z } from "@hono/zod-openapi";

export const seekerProfileSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    displayName: z.string().nullable(),
    icNumber: z.string().nullable(),
    dateOfBirth: z.string().nullable(),
    gender: z.string().nullable(),
    city: z.string().nullable(),
    highestEducation: z.string().nullable(),
    fieldOfStudy: z.string().nullable(),
    yearsOfExperience: z.number().int().nullable(),
    skills: z.string().nullable(),
    preferredLocation: z.string().nullable(),
    preferredEmploymentType: z.string().nullable(),
    isMalaysian: z.boolean(),
    hasWorkPermit: z.boolean(),
    complete: z.boolean(),
  })
  .openapi("SeekerProfile");

export const updateSeekerProfileBodySchema = z
  .object({
    displayName: z.string().min(1).max(200).optional(),
    icNumber: z.string().min(6).max(20).optional(),
    dateOfBirth: z.string().min(4).max(32).optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    city: z.string().min(1).max(120).optional(),
    highestEducation: z.string().min(1).max(120).optional(),
    fieldOfStudy: z.string().min(1).max(120).optional(),
    yearsOfExperience: z.number().int().min(0).max(60).optional(),
    skills: z.string().min(1).max(2000).optional(),
    preferredLocation: z.string().min(1).max(120).optional(),
    preferredEmploymentType: z
      .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"])
      .optional(),
    isMalaysian: z.boolean().optional(),
    hasWorkPermit: z.boolean().optional(),
  })
  .openapi("UpdateSeekerProfileBody");
