# Awash Risk Dashboard – Technical Overview

This document lists the key moving parts of the project so you can reason about features, change them safely, and run the stack end-to-end without guesswork.

## 1. Architecture Summary
- **Frontend**: Vite + React 18 app under `client/`, routing via `wouter`, state via React Query, UI built from custom components (`SidebarProvider`, `AppSidebar`, charts, tables).
- **Backend**: TypeScript Express server under `server/`. Routes in `server/routes.ts` expose auth, risk, ingestion, audit-log, reporting, and financial indicators endpoints. Persistence flows through `server/storage.ts` which calls Drizzle ORM (`server/db.ts`).
- **Database**: PostgreSQL accessed with a long-lived `pg` Pool. Schema/type definitions reside in `@shared/schema`, which both backend and (optionally) frontend use for consistency.
- **Build Output**: `npm run build` emits a static client bundle under `dist/public` (from Vite) and a server bundle at `dist/index.js` (from `scripts/build-server.mjs` + esbuild). `npm start` runs that bundle in production mode.

## 2. Directory Layout
```
client/          React SPA (entry: src/main.tsx → src/App.tsx)
server/          Express app (index.ts bootstraps, routes.ts wiring, storage.ts data-access)
server/env.ts    Loads dotenv before any DB access
server/db.ts     Creates the pg pool + Drizzle instance
server/vite.ts   Dev-only Vite middleware and static serving helpers
shared/          Zod schemas + Drizzle table definitions (imported as @shared/schema)
scripts/         Helper scripts, e.g., build-server.mjs (esbuild wrapper)
dist/            Production artifacts after `npm run build`
.env             Environment variables (ignored in VCS)
postcss.config.js, tailwind.config.js  → Styling toolchain
```

## 3. Frontend Flow
- `client/src/main.tsx` hydrates `<App />`.
- `App.tsx` wraps the router with `QueryClientProvider`, `ThemeProvider`, `TooltipProvider`, `AuthProvider`, and global UI like `Toaster`.
- Routing: `wouter` + `ProtectedRoute` guard. Auth state determined by `AuthProvider`; unauthenticated users are redirected to `/login`.
- Pages:
  - `login` handles credential submission.
  - `dashboard`, `risks`, `risk-form`, `upload`, `admin`, `reports` all call backend APIs via React Query hooks (see `client/src/lib`).
  - Sidebar + header include navigation, theme toggle, etc.
- Styling: Tailwind CSS (configured via `tailwind.config.js`), autoprefixed via `postcss.config.js`.

## 4. Backend Flow
- `server/index.ts`:
  1. Loads env (`dotenv`) and logs the resolved `DATABASE_URL` once so you can verify config.
  2. Creates the Express app, adds JSON/urlencoded parsers (with raw body capture for auditing), and attaches a request/response logger for `/api` routes.
  3. Calls `registerRoutes(app)` to mount all business endpoints.
  4. Adds centralized error handling that never throws in ESM contexts.
  5. **Environment split**:
     - `development`: dynamically imports `setupVite` to mount Vite’s dev middleware and enable HMR.
     - `production`: dynamically imports `serveStatic` to serve the prebuilt client from `dist/public`.
  6. Starts the HTTP server on `PORT` (default 5000) bound to `0.0.0.0`.
- `server/routes.ts`:
  - Declares auth middleware (JWT verification, role checks).
  - Auth endpoints (`/api/auth/login`, `/api/auth/me`).
  - User management (plaintext passwords validated for min-length then hashed on create), risk CRUD, ingestion staging, audit logging, reporting, and approval workflows.
  - Financial data ingestion endpoints (`/api/financial/upload`, `/api/financial/entries`, `/api/financial/indicators`) that compute LCR, NSFR, loan-to-deposit, FX trends, and balance breakdowns.
  - Uses Multer for file uploads and logs administrative actions via `logAudit`.
- `server/storage.ts`:
  - Implements the `DatabaseStorage` class (an `IStorage` interface) across Users, Risk Records, Ingestion Staging, Audit Logs, Email Reports.
  - Uses Drizzle query builder plus shared schema types to keep SQL type-safe.
  - Handles risk scoring calculations (likelihood × impact), data transformations when approving staging data, and aggregation logic for financial indicators (LCR, NSFR, loan/deposit, FX trend).
- `server/db.ts`:
  - Imports `./env` first so `dotenv.config()` already ran.
  - Ensures `process.env.DATABASE_URL` is present (fail-fast in prod, or set via `.env`).
  - Exposes a singleton pg `Pool` and Drizzle `db`.

## 5. Environment & Configuration
- `.env` (not committed) should define at least:
  ```
  NODE_ENV=development
  PORT=5000
  DATABASE_URL=postgres://<user>:<password>@localhost:5432/awash_risk_dashboard
  JWT_SECRET=<strong random value>
  ```
- `server/env.ts` runs `dotenv.config()` before any DB work. Importing `server/db.ts` now automatically loads env vars.
- PostCSS/Tailwind: `postcss.config.js` includes `tailwindcss` + `autoprefixer`. `tailwind.config.js` points to relevant `client/src/**/*.{ts,tsx}` files to tree-shake classes.

## 6. Build & Runtime Pipeline
1. **Install**: `npm install`.
2. **Build**: `npm run build`
   - Runs `vite build` to emit the SPA into `dist/public`.
   - Runs `node scripts/build-server.mjs`, which triggers esbuild with:
     - Entry `server/index.ts`
     - Platform `node`, format `esm`
     - Output `dist/index.js`
     - Externalizes `lightningcss` and `vite`
     - Prepends an ESM-safe banner that defines `require`, `__filename`, `__dirname`.
3. **Run in production**: `npm start` (`cross-env NODE_ENV=production node dist/index.js`).
4. **Run in development**: `npm run dev` (tsx + live Vite dev server).

## 7. Database Expectations
- Requires a running PostgreSQL instance accessible via `DATABASE_URL`.
- Schema migrations handled through Drizzle (see `drizzle.config.*` and `npm run db:push`).
- `@shared/schema` persists table definitions and Zod validators used both server-side and in TS types.

## 8. Key Functionalities
- **Authentication**: Email/password login (bcrypt hash check), JWT issuance, `authMiddleware` for subsequent requests, role-based access control (superadmin, risk_admin, auditor, etc.).
- **Risk Management**: CRUD for risk records with scoring calculations, filtering by department/role, and dashboards on the frontend.
- **Data Ingestion**: CSV uploads handled by Multer, stored in `ingestionStaging`, later approved into `riskRecords`. During approval, column names are normalized (case/spacing-insensitive) so exported templates or custom headers (e.g., `Risk Type`, `risk_type`) map automatically. Financial/non-financial uploads feed `financial_entries` for dashboard metrics.
- **Auditing**: Every sensitive action logs to `auditLogs`, retrievable by auditors.
- **Reporting**: Email report creation, dashboards, and React visualizations (charts/tables).
- **Financial Analytics**: Upload & parse CSV/XLSX for assets/liabilities, categorize entries, compute liquidity and FX indicators, and surface them on the dashboard UI.

## 9. Dev/Prod Behavior
- Vite middleware is only initialized when `NODE_ENV === "development"`.
- Static assets in prod served from `dist/public`.
- Logging middleware truncates long JSON responses to preserve log readability.
- Error handler never rethrows (important for bundled ESM output).

## 10. Operational Checklist
1. Ensure `.env` exists with a valid `DATABASE_URL` that points to your local Postgres instance.
2. `npm install`
3. `npm run db:push` (if schema migrations are pending)
4. `npm run dev` for development or `npm run build && npm start` for production-like testing.
5. Monitor server logs for `serving on port ...` and API call logs.

Keep this document close when onboarding teammates or revisiting the stack after a break—it reflects the current architecture after the recent debugging work (ESM-safe bundling, deferred Vite imports, dotenv loading, etc.).

