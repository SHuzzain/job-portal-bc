import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { notFound, onError } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import { env } from "../env.ts";
import { pinoLoggerMiddleware } from "../middleware/pino-logger.ts";
import { sessionMiddleware } from "../middleware/session-auth.ts";
import type { AppBindings, AppOpenAPI } from "./types.ts";

export function createRouter(): AppOpenAPI {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export function createApp(): AppOpenAPI {
  const app = createRouter();

  app.use(
    "*",
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "x-locale",
        "x-webhook-secret",
      ],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  );

  app.use(pinoLoggerMiddleware());
  app.use(sessionMiddleware);
  app.onError(onError);
  app.notFound(notFound);

  return app;
}
