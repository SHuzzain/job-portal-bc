# job-templete-bc

Hono + PostgreSQL (Drizzle) API with Better Auth (organization + OpenAPI plugins).

## Setup

```bash
cp .env.example .env
pnpm install
pnpm db:push
pnpm dev
```

- API: `http://localhost:3001`
- App OpenAPI: `/doc` and `/reference`
- Better Auth: `/api/auth/*` (frontend `authClient` base URL)
- Auth OpenAPI: `/api/auth/reference`

`FRONTEND_URL` must match the Next.js origin (`http://localhost:3000`).
