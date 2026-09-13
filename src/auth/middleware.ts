import { eq } from "drizzle-orm"
import type { Context } from "hono"
import { createMiddleware } from "hono/factory"
import { db } from "../db/index.ts"
import { organization as orgTable } from "../db/schema.ts"
import type { AppBindings } from "../lib/types.ts"
import { auth } from "./index.ts"

async function resolveSession(c: Context<AppBindings>) {
  const existing = c.get("session")
  if (existing) {
    return existing
  }

  return auth.api.getSession({
    headers: c.req.raw.headers,
  })
}

export const requireApprovedCompany = createMiddleware<AppBindings>(async (c, next) => {
  const session = await resolveSession(c)

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const activeOrgId = (
    session.session as { activeOrganizationId?: string | null }
  ).activeOrganizationId
  if (!activeOrgId) {
    return c.json({ error: "No active company selected" }, 400)
  }

  const company = await db.query.organization.findFirst({
    where: eq(orgTable.id, activeOrgId),
  })

  if (!company || company.status !== "APPROVED") {
    return c.json(
      {
        error: "Company approval required",
        status: company?.status ?? "PENDING_APPROVAL",
      },
      403,
    )
  }

  c.set("session", session)
  await next()
})

const pasakRoles = new Set(["admin", "super_admin"])

export const requirePasakAdmin = createMiddleware<AppBindings>(async (c, next) => {
  const session = await resolveSession(c)

  if (!session) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  const role = typeof session.user.role === "string" ? session.user.role : ""
  if (!pasakRoles.has(role)) {
    return c.json({ message: "PASAK admin access required" }, 403)
  }

  c.set("session", session)
  await next()
})

export const requireJobseeker = createMiddleware<AppBindings>(async (c, next) => {
  const session = await resolveSession(c)

  if (!session) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  const role = typeof session.user.role === "string" ? session.user.role : ""
  if (role !== "jobseeker" && role !== "admin" && role !== "super_admin") {
    return c.json({ message: "Jobseeker access required" }, 403)
  }

  c.set("session", session)
  await next()
})

export const requireTvetCompany = createMiddleware<AppBindings>(async (c, next) => {
  const session = await resolveSession(c)

  if (!session) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  const role = typeof session.user.role === "string" ? session.user.role : ""
  const capable = session.user.hasTvetCapability === true
  if (role === "employer" && !capable) {
    return c.json({ message: "TVET capability required" }, 403)
  }
  if (role !== "employer" && role !== "admin" && role !== "super_admin") {
    return c.json({ message: "TVET employer access required" }, 403)
  }

  const activeOrgId = (
    session.session as { activeOrganizationId?: string | null }
  ).activeOrganizationId
  if (!activeOrgId) {
    return c.json({ error: "No active company selected" }, 400)
  }

  const company = await db.query.organization.findFirst({
    where: eq(orgTable.id, activeOrgId),
  })

  if (!company || company.status !== "APPROVED") {
    return c.json(
      {
        error: "Company approval required",
        status: company?.status ?? "PENDING_APPROVAL",
      },
      403,
    )
  }

  c.set("session", session)
  await next()
})
