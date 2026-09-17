# Next.js and Express Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the .NET implementation with a buildable, tested Next.js and Express TypeScript monorepo that preserves issues #21 through #25.

**Architecture:** A pnpm workspace contains a statically exported Next.js frontend and an Express API. Express uses Prisma 7 with Azure SQL and exposes the same health, authentication, and role-access contracts as the existing API.

**Tech Stack:** Node.js 24, pnpm 10, Next.js 16, React 19, Express 5, Prisma 7, SQL Server, Vitest, Supertest

**Spec:** `docs/superpowers/specs/2026-09-17-next-express-migration-design.md`

## Global Constraints

- Keep the frontend and backend independently deployable.
- Keep the existing REST paths and authentication response fields.
- Keep all ERD entities and database constraints.
- Keep secrets out of frontend configuration.
- Use Prisma 7 for SQL Server support.
- Do not implement marketplace, order, dashboard, AI, or Azure provisioning features from later issues.

---

### Task 1: Workspace and backend contract tests

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/vitest.config.ts`
- Create: `backend/src/app.test.ts`

**Interfaces:**
- Consumes: legacy HTTP behavior documented in the spec.
- Produces: executable tests against `createApp({ users, jwt })`.

- [x] **Step 1: Add workspace and backend test configuration**

Use root scripts `dev`, `build`, `lint`, and `test`; backend uses Vitest with Supertest and TypeScript strict mode.

- [x] **Step 2: Write request tests first**

Tests call the real Express app and assert these literal outcomes:

```typescript
expect((await request(app).get('/api/health')).status).toBe(200)
expect(register.status).toBe(201)
expect(register.body.email).toBe('customer@example.com')
expect(register.body.role).toBe('Customer')
expect(register.body).not.toHaveProperty('passwordHash')
expect((await request(app).get('/api/access/customer')).status).toBe(401)
```

The suite also proves duplicate email is `409`, unknown roles and malformed bodies are `400`, bad credentials share one `401` title, and each role receives `200` only from its own route.

- [x] **Step 3: Install dependencies and verify RED**

Run: `pnpm install && pnpm --dir backend test`

Expected: FAIL because `backend/src/app.ts` does not exist.

### Task 2: Express authentication and role access

**Files:**
- Create: `backend/src/app.ts`
- Create: `backend/src/auth.ts`
- Create: `backend/src/config.ts`
- Create: `backend/src/server.ts`

**Interfaces:**
- Consumes: a user store with `findByEmail(email)` and `create(input)` methods.
- Produces: `createApp(dependencies)`, JWT authentication, and the five preserved routes.

- [x] **Step 1: Implement minimal API behavior**

Validate request bodies at the HTTP boundary, normalize email and roles, hash passwords with bcrypt, issue one-hour HS256 JWTs, and use Bearer authentication for protected routes.

- [x] **Step 2: Verify GREEN**

Run: `pnpm --dir backend test`

Expected: all request tests pass.

- [x] **Step 3: Add production safeguards**

Require a JWT secret of at least 32 bytes, limit auth requests to ten per minute per IP, set Helmet headers, restrict CORS to `FRONTEND_URL`, and listen on `PORT`.

- [x] **Step 4: Re-run tests and type-check**

Run: `pnpm --dir backend test && pnpm --dir backend build`

Expected: both commands exit zero.

### Task 3: Prisma and Azure SQL schema

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma.config.ts`
- Create: `backend/prisma/migrations/20260917000000_initial/migration.sql`
- Create: `backend/src/database.ts`
- Create: `backend/.env.example`

**Interfaces:**
- Consumes: `DATABASE_URL` in SQL Server connection-string form.
- Produces: Prisma-backed implementations of `findByEmail` and `create` plus generated database types.

- [x] **Step 1: Define every ERD model and relation**

Map all eleven entities, decimal/date types, foreign keys, unique keys, lengths, and SQL Server table names from the legacy EF migration.

- [x] **Step 2: Generate the initial migration SQL**

Include the legacy check constraints for prices, quantities, production totals, and pickup windows as SQL because Prisma schema syntax does not express them.

- [x] **Step 3: Wire Prisma into `server.ts`**

Create one Prisma client with the Microsoft SQL Server adapter and pass the user operations into `createApp`.

- [x] **Step 4: Validate and generate**

Run: `pnpm --dir backend prisma:validate && pnpm --dir backend prisma:generate && pnpm --dir backend build`

Expected: schema validation, client generation, and compilation exit zero without a live database.

### Task 4: Next.js frontend

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/next.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/eslint.config.mjs`
- Create: `frontend/app/layout.tsx`
- Create: `frontend/app/page.tsx`
- Create: `frontend/app/login/page.tsx`
- Create: `frontend/app/register/page.tsx`
- Create: `frontend/app/globals.css`
- Create: `frontend/.env.example`

**Interfaces:**
- Consumes: public `NEXT_PUBLIC_API_URL`.
- Produces: static routes `/`, `/login`, and `/register` in `frontend/out`.

- [x] **Step 1: Configure Next.js static export**

Set `output: 'export'`, use TypeScript/App Router, and expose a public API base URL example.

- [x] **Step 2: Implement the three placeholder routes**

Add minimal, unstyled placeholder content for `/`, `/login`, and `/register`. Product UI and form behavior remain outside issue #21.

- [x] **Step 3: Verify frontend**

Run: `pnpm --dir frontend lint && pnpm --dir frontend build`

Expected: lint exits zero and `frontend/out/index.html`, `frontend/out/login/index.html`, and `frontend/out/register/index.html` exist.

### Task 5: Remove .NET and update project operations

**Files:**
- Delete: `.config/dotnet-tools.json`
- Delete: `backend/Replate.Api/`
- Delete: `backend/Replate.Api.Tests/`
- Modify: `.github/workflows/main.yml`
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `docs/index.md`

**Interfaces:**
- Consumes: root pnpm scripts.
- Produces: Node.js-only local and CI workflow documentation.

- [x] **Step 1: Replace CI**

Use Node.js 24 and pnpm 10; run frozen install, lint, tests, Prisma validation/generation, and production builds.

- [x] **Step 2: Replace documentation**

Document local commands, environment variables, unchanged endpoints, Prisma migration commands, and the planned Azure Static Web Apps/App Service/Azure SQL deployment.

- [x] **Step 3: Remove the superseded .NET files**

Delete only tracked .NET source, project, tool, and migration files. Preserve user-owned untracked files.

- [x] **Step 4: Run complete verification**

Run: `pnpm lint && pnpm test && pnpm build && pnpm --dir backend prisma:validate && git diff --check`

Expected: every command exits zero and the frontend static output exists.
