import { z } from "zod"
import "dotenv/config"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  FRONTEND_URL: z.url(),
  LOG_LEVEL: z.string().default("debug"),
  WORKFLOW_TARGET_WORLD: z.literal("@workflow/world-postgres").default("@workflow/world-postgres"),
  WORKFLOW_POSTGRES_URL: z.string().min(1).optional(),
  INTERVIEW_REPLY_WEBHOOK_SECRET: z.string().min(32).optional(),
  MYDIGITALID_CLIENT_ID: z.string().optional(),
  MYDIGITALID_CLIENT_SECRET: z.string().optional(),
})

export const env = envSchema.parse(process.env)
process.env.WORKFLOW_TARGET_WORLD = env.WORKFLOW_TARGET_WORLD
process.env.WORKFLOW_POSTGRES_URL ??= env.WORKFLOW_POSTGRES_URL ?? env.DATABASE_URL
export type Env = z.infer<typeof envSchema>
