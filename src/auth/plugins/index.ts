import { bearer } from "better-auth/plugins";

import { adminPlugin } from "./admin.ts";
import { customSessionPlugin } from "./custom-session.ts";
import { i18nPlugin } from "./i18n.ts";
import { multiSessionPlugin } from "./multi-session.ts";
import { createGenericOAuthPlugin } from "./oauth.ts";
import { openApiPlugin } from "./open-api.ts";
import { organizationPlugin } from "./organization.ts";

const oauthPlugin = createGenericOAuthPlugin();

export const authPlugins = [
  adminPlugin,
  organizationPlugin,
  customSessionPlugin,
  multiSessionPlugin,
  bearer(),
  openApiPlugin,
  i18nPlugin,
  ...(oauthPlugin ? [oauthPlugin] : []),
];
