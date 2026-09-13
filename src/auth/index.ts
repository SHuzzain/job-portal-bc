import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { betterAuth } from "better-auth"
import { db } from "../db/index.ts"
import * as schema from "../db/schema.ts"
import { env } from "../env.ts"
import { authPlugins } from "./plugins/index.ts"

const signupRoles = new Set(["jobseeker", "employer"])

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.FRONTEND_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
        input: true,
      },
      accountStatus: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
        input: false,
      },
      hasTvetCapability: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const requested = (ctx?.body as { role?: unknown } | undefined)?.role
          if (typeof requested === "string" && signupRoles.has(requested)) {
            return { data: { ...user, role: requested } }
          }
          return { data: user }
        },
      },
    },
  },
  plugins: authPlugins,
})
