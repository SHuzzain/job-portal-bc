import { customSession } from "better-auth/plugins"
import * as platformRolesService from "../../features/platform-roles/platform-roles.service.ts"
import type { PermissionMap } from "../access/catalog.ts"

export const customSessionPlugin = customSession(async ({ user, session }) => {
  const role = "role" in user && typeof user.role === "string" ? user.role : undefined
  const permissions: PermissionMap =
    await platformRolesService.permissionsForRoleName(role)

  return {
    user: {
      ...user,
      role,
      accountStatus: "accountStatus" in user ? user.accountStatus : undefined,
      hasTvetCapability: "hasTvetCapability" in user ? user.hasTvetCapability : undefined,
      permissions,
    },
    session,
  }
})
