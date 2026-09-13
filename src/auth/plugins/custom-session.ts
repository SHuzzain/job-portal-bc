import { customSession } from "better-auth/plugins"

export const customSessionPlugin = customSession(async ({ user, session }) => ({
  user: {
    ...user,
    role: "role" in user ? user.role : undefined,
    accountStatus: "accountStatus" in user ? user.accountStatus : undefined,
    hasTvetCapability: "hasTvetCapability" in user ? user.hasTvetCapability : undefined,
  },
  session,
}))
