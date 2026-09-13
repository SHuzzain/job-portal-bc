import { genericOAuth } from "better-auth/plugins"
import { env } from "../../env.ts"

export function createGenericOAuthPlugin() {
  if (!env.MYDIGITALID_CLIENT_ID || !env.MYDIGITALID_CLIENT_SECRET) {
    return null
  }

  return genericOAuth({
    config: [
      {
        providerId: "mydigitalid",
        clientId: env.MYDIGITALID_CLIENT_ID,
        clientSecret: env.MYDIGITALID_CLIENT_SECRET,
        discoveryUrl: "https://auth.mydigitalid.gov.my/.well-known/openid-configuration",
        scopes: ["openid", "profile", "email"],
      },
    ],
  })
}
