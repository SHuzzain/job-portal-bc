import { pinoLogger } from "hono-pino"
import pino from "pino"
import { env } from "../env.ts"

// pino-pretty runs in a worker thread that resolves its entry with `__dirname`,
// which does not exist in the bundled ESM output. Fall back to plain JSON logs
// instead of crashing at startup.
function createLogger() {
  if (env.NODE_ENV === "production") {
    return pino({ level: "info" })
  }

  try {
    return pino({
      level: env.LOG_LEVEL,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    })
  } catch {
    return pino({ level: env.LOG_LEVEL })
  }
}

export function pinoLoggerMiddleware() {
  return pinoLogger({
    pino: createLogger(),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  })
}
