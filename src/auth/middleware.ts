import { eq } from "drizzle-orm"
import type { Context } from "hono"
import { createMiddleware } from "hono/factory"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { db } from "../db/index.ts"
import { organization as orgTable } from "../db/schema.ts"
import * as platformRolesService from "../features/platform-roles/platform-roles.service.ts"
import { activeOrganizationId, authedSession } from "../lib/session.ts"
import type { AppBindings } from "../lib/types.ts"
import {
  hasPermission,
  organizationResourceStatements,
  type PermissionMap,
} from "./access/catalog.ts"
import { auth } from "./index.ts"

async function bindApprovedCompany(c: Context<AppBindings>) {
  const organizationId = activeOrganizationId(authedSession(c))
  if (!organizationId) {
    return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
  }

  const company = await db.query.organization.findFirst({
    where: eq(orgTable.id, organizationId),
  })

  if (!company || company.status !== "APPROVED") {
    return c.json(
      {
        message: "Company approval required",
        status: company?.status ?? "PENDING_APPROVAL",
      },
      HttpStatusCodes.FORBIDDEN,
    )
  }

  c.set("organizationId", organizationId)
  return null
}

export const requireActiveCompany = createMiddleware<AppBindings>(async (c, next) => {
  const organizationId = activeOrganizationId(authedSession(c))
  if (!organizationId) {
    return c.json({ message: "No active company selected" }, HttpStatusCodes.BAD_REQUEST)
  }

  c.set("organizationId", organizationId)
  await next()
})

export const requireApprovedCompany = createMiddleware<AppBindings>(async (c, next) => {
  const rejected = await bindApprovedCompany(c)
  if (rejected) {
    return rejected
  }

  await next()
})

async function platformPermissions(c: Context<AppBindings>): Promise<PermissionMap> {
  const session = authedSession(c)
  const attached = (session.user as { permissions?: unknown }).permissions
  if (attached && typeof attached === "object") {
    return attached as PermissionMap
  }

  const role = typeof session.user.role === "string" ? session.user.role : null
  return platformRolesService.permissionsForRoleName(role)
}

/**
 * Grants access when the caller's platform role allows the action, or when the
 * resource also exists at company scope and their organization role allows it.
 */
export function requirePermission(resource: string, action: string) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const permissions = await platformPermissions(c)
    if (hasPermission(permissions, resource, action)) {
      await next()
      return
    }

    if (resource in organizationResourceStatements) {
      const result = await auth.api.hasPermission({
        headers: c.req.raw.headers,
        body: { permissions: { [resource]: [action] } },
      })
      if (result?.success) {
        await next()
        return
      }
    }

    return c.json(
      { message: `Missing ${resource}.${action} permission` },
      HttpStatusCodes.FORBIDDEN,
    )
  })
}

/**
 * For endpoints whose required action depends on the payload, such as a review
 * that can approve, reject or return. The body is read from Hono's cache, so
 * the route validator still receives it.
 */
export function requirePermissionFor(
  resource: string,
  resolve: (body: Record<string, unknown>) => string | null,
) {
  return createMiddleware<AppBindings>(async (c, next) => {
    let action: string | null = null
    try {
      const body = await c.req.json<Record<string, unknown>>()
      action = resolve(body ?? {})
    } catch {
      action = null
    }

    if (!action) {
      return c.json({ message: "Unsupported action" }, HttpStatusCodes.BAD_REQUEST)
    }

    return requirePermission(resource, action)(c, next)
  })
}

/** Same as requirePermission, but also binds an approved active company. */
export function requireCompanyPermission(resource: string, action: string) {
  const guard = requirePermission(resource, action)
  return createMiddleware<AppBindings>(async (c, next) => {
    const rejected = await bindApprovedCompany(c)
    if (rejected) {
      return rejected
    }

    return guard(c, next)
  })
}

export const requireTvetCompany = createMiddleware<AppBindings>(async (c, next) => {
  const session = authedSession(c)

  const role = typeof session.user.role === "string" ? session.user.role : ""
  const capable = session.user.hasTvetCapability === true
  if (role === "employer" && !capable) {
    return c.json({ message: "TVET capability required" }, HttpStatusCodes.FORBIDDEN)
  }

  const rejected = await bindApprovedCompany(c)
  if (rejected) {
    return rejected
  }

  await next()
})

/** TVET provider routes: capability plus the specific resource action. */
export function requireTvetPermission(resource: string, action: string) {
  const guard = requirePermission(resource, action)
  return createMiddleware<AppBindings>(async (c, next) => {
    return requireTvetCompany(c, async () => {
      await guard(c, next)
    })
  })
}
