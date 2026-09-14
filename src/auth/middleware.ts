import { eq } from "drizzle-orm"
import type { Context } from "hono"
import { createMiddleware } from "hono/factory"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { db } from "../db/index.ts"
import { organization as orgTable } from "../db/schema.ts"
import { activeOrganizationId, authedSession } from "../lib/session.ts"
import type { AppBindings } from "../lib/types.ts"

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

const pasakRoles = new Set(["admin", "super_admin"])

export const requirePasakAdmin = createMiddleware<AppBindings>(async (c, next) => {
  const session = authedSession(c)

  const role = typeof session.user.role === "string" ? session.user.role : ""
  if (!pasakRoles.has(role)) {
    return c.json({ message: "PASAK admin access required" }, 403)
  }

  await next()
})

export const requireJobseeker = createMiddleware<AppBindings>(async (c, next) => {
  const session = authedSession(c)

  const role = typeof session.user.role === "string" ? session.user.role : ""
  if (role !== "jobseeker" && role !== "admin" && role !== "super_admin") {
    return c.json({ message: "Jobseeker access required" }, 403)
  }

  await next()
})

export const requireTvetCompany = createMiddleware<AppBindings>(async (c, next) => {
  const session = authedSession(c)

  const role = typeof session.user.role === "string" ? session.user.role : ""
  const capable = session.user.hasTvetCapability === true
  if (role === "employer" && !capable) {
    return c.json({ message: "TVET capability required" }, 403)
  }
  if (role !== "employer" && role !== "admin" && role !== "super_admin") {
    return c.json({ message: "TVET employer access required" }, 403)
  }

  const rejected = await bindApprovedCompany(c)
  if (rejected) {
    return rejected
  }

  await next()
})
