import type { Context } from "hono";

import type { AppBindings } from "./types.ts";

export type Session = NonNullable<AppBindings["Variables"]["session"]>;

export function authedSession(c: Context<AppBindings>) {
  return c.get("session") as Session;
}

export function activeOrganizationId(session: Session) {
  const id = (session.session as { activeOrganizationId?: unknown })
    .activeOrganizationId;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export function organizationId(c: Context<AppBindings>) {
  return c.get("organizationId");
}
