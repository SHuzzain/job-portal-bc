import { customSession } from "better-auth/plugins"
import * as platformRolesService from "../../features/platform-roles/platform-roles.service.ts"
import type { PermissionMap } from "../access/catalog.ts"
import { effectiveWorkspace, permissionRoleName } from "../access/workspace.ts"

export const customSessionPlugin = customSession(
  async ({ user, session }) => {
    const role = "role" in user && typeof user.role === "string" ? user.role : undefined
    const hasTvetCapability =
      "hasTvetCapability" in user ? user.hasTvetCapability : undefined
    const activeWorkspace = effectiveWorkspace({
      role,
      hasTvetCapability,
      activeWorkspace: "activeWorkspace" in user ? user.activeWorkspace : undefined,
    })
    const permissions: PermissionMap =
      await platformRolesService.permissionsForRoleName(
        permissionRoleName({
          role,
          hasTvetCapability,
          activeWorkspace,
        }),
      )

    return {
      user: {
        ...user,
        role,
        accountStatus: "accountStatus" in user ? user.accountStatus : undefined,
        hasTvetCapability,
        activeWorkspace,
        permissions,
      },
      session,
    }
  },
  undefined,
  { shouldMutateListDeviceSessionsEndpoint: true },
)
