import * as HttpStatusCodes from "stoker/http-status-codes"
import { createMiddleware } from "hono/factory"
import { auth } from "../auth/index.ts"
import type { AppBindings } from "../lib/types.ts"

const publicPrefixes = ["/api/auth", "/doc", "/reference"]

function isPublicPath(method: string, path: string) {
  if (publicPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return true
  }

  if (method !== "GET") {
    return false
  }

  if (path === "/vacancies") {
    return true
  }

  if (path.startsWith("/vacancies/mine")) {
    return false
  }

  return /^\/vacancies\/[^/]+$/.test(path)
}

export const sessionMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const currentPath = c.req.path

  if (c.req.method === "OPTIONS" || isPublicPath(c.req.method, currentPath)) {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })
    c.set("session", session)
    await next()
    return
  }

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return c.json(
      {
        message: "Unauthorized",
      },
      HttpStatusCodes.UNAUTHORIZED,
    )
  }

  c.set("session", session)
  await next()
})
