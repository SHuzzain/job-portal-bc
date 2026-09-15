import { Scalar } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "./types.ts";

export function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.1.0",
    info: {
      title: "Job Templete API",
      version: "0.0.1",
    },
  });

  app.get(
    "/reference",
    Scalar({
      pageTitle: "Job Templete API",
      sources: [
        { url: "/doc", title: "API" },
        { url: "/api/auth/open-api/generate-schema", title: "Auth" },
      ],
    })
  );
}
