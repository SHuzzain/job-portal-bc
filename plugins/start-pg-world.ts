import { definePlugin } from "nitro"
import { env } from "../src/env.ts"

export default definePlugin(async () => {
  process.env.PORT ??= String(env.PORT)
  process.env.WORKFLOW_TARGET_WORLD = env.WORKFLOW_TARGET_WORLD
  process.env.WORKFLOW_POSTGRES_URL ??= env.WORKFLOW_POSTGRES_URL ?? env.DATABASE_URL

  const { getWorld } = await import("workflow/runtime")
  const started = getWorld().start?.()
  if (started) {
    started.catch((error: unknown) => {
      console.error("Workflow postgres world failed to start", error)
    })
  }
})
