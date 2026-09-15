import { z } from "@hono/zod-openapi";

export const platformUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string().nullable(),
    accountStatus: z.string().nullable(),
    hasTvetCapability: z.boolean().nullable(),
    banned: z.boolean().nullable(),
    createdAt: z.string(),
  })
  .openapi("PlatformUser");

export const platformUserIdParamSchema = z
  .object({ id: z.string().min(1) })
  .openapi("PlatformUserIdParam");

export const createPlatformUserBodySchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.email(),
    password: z.string().min(8).max(128),
    role: z.string().trim().min(2).max(40),
  })
  .openapi("CreatePlatformUserBody");

export const assignPlatformRoleBodySchema = z
  .object({ role: z.string().trim().min(2).max(40) })
  .openapi("AssignPlatformRoleBody");

export const updatePlatformUserBodySchema = z
  .object({ accountStatus: z.enum(["ACTIVE", "SUSPENDED"]) })
  .openapi("UpdatePlatformUserBody");
