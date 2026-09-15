import { z } from "@hono/zod-openapi";

import {
  actionsFor,
  platformResourceStatements,
} from "../../../auth/access/catalog.ts";

const permissionsSchema = z
  .record(z.string(), z.array(z.string()))
  .superRefine((value, ctx) => {
    for (const [resource, actions] of Object.entries(value)) {
      if (!(resource in platformResourceStatements)) {
        ctx.addIssue({
          code: "custom",
          message: `Unknown resource: ${resource}`,
          path: [resource],
        });
        continue;
      }
      const allowed = actionsFor(resource);
      for (const action of actions) {
        if (!allowed.includes(action)) {
          ctx.addIssue({
            code: "custom",
            message: `Action ${action} is not supported by ${resource}`,
            path: [resource],
          });
        }
      }
    }
  })
  .openapi("PlatformRolePermissions");

export const platformRoleSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    label: z.string(),
    permissions: z.record(z.string(), z.array(z.string())),
    isSystem: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("PlatformRole");

export const platformRoleIdParamSchema = z
  .object({ id: z.string().min(1) })
  .openapi("PlatformRoleIdParam");

export const createPlatformRoleBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(40)
      .regex(
        /^[a-z][a-z0-9_]*$/,
        "Use lowercase letters, digits and underscores"
      ),
    label: z.string().trim().min(2).max(80),
    permissions: permissionsSchema,
  })
  .openapi("CreatePlatformRoleBody");

export const updatePlatformRoleBodySchema = z
  .object({
    label: z.string().trim().min(2).max(80).optional(),
    permissions: permissionsSchema.optional(),
  })
  .openapi("UpdatePlatformRoleBody");
