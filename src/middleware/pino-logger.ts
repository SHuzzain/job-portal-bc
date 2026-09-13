import { pinoLogger } from "hono-pino"
import pino from "pino"
import { env } from "../env.ts"

export function pinoLoggerMiddleware() {
  return pinoLogger({
    pino: pino(
      env.NODE_ENV === "production"
        ? { level: "info" }
        : {
            level: env.LOG_LEVEL,
            transport: {
              target: "pino-pretty",
              options: {
                colorize: true,
              },
            },
          },
    ),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  })
}
