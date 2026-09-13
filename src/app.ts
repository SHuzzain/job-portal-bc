import { auth } from "./auth/index.ts"
import { configureOpenAPI } from "./lib/configure-open-api.ts"
import { createApp } from "./lib/create-app.ts"
import routes from "./routes/index.ts"

const app = createApp()

configureOpenAPI(app)

app.all("/api/auth/*", (c) => auth.handler(c.req.raw))
app.route("/", routes)

export default app
export type AppType = typeof app
