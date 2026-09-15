import { serve } from "@hono/node-server";

import app from "./app.ts";
import { env } from "./env.ts";

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`API listening on http://localhost:${info.port}`);
    console.log(`OpenAPI: http://localhost:${info.port}/doc`);
    console.log(`API docs: http://localhost:${info.port}/reference`);
    console.log(`Auth docs: http://localhost:${info.port}/api/auth/reference`);
  }
);
