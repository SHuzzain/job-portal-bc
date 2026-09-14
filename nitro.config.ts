import { defineConfig } from "nitro"

const config = {
  modules: ["workflow/nitro"],
  plugins: ["plugins/start-pg-world.ts"],
  routes: {
    "/**": "./src/app.ts",
  },
  workflow: {
    dirs: ["src/workflows"],
    typescriptPlugin: true,
  },
}

export default defineConfig(config)
