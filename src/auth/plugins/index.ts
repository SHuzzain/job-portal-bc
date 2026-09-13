import { bearer } from "better-auth/plugins"
import { adminPlugin } from "./admin.ts"
import { customSessionPlugin } from "./custom-session.ts"
import { createGenericOAuthPlugin } from "./oauth.ts"
import { openApiPlugin } from "./open-api.ts"
import { organizationPlugin } from "./organization.ts"

const oauthPlugin = createGenericOAuthPlugin()

export const authPlugins = [
  adminPlugin,
  organizationPlugin,
  customSessionPlugin,
  bearer(),
  openApiPlugin,
  ...(oauthPlugin ? [oauthPlugin] : []),
]
