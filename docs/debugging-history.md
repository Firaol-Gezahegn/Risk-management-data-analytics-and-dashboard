# Awash Risk Dashboard – Debugging Reference

A chronological record of the issues fixed so far, why they occurred, and how they were resolved. Keep extending this log as you continue developing; it doubles as a troubleshooting playbook.

## 1. Dynamic `require("path")` Not Supported
- **Symptom**: `npm start` failed with `Error: Dynamic require of "path" is not supported` inside the server bundle (`dist/index.js`).
- **Root Cause**: The backend is bundled as ESM. Some CommonJS dependencies (e.g., Express → body-parser → depd) expect `require`, `__dirname`, `__filename`, and direct access to Node built-ins. Esbuild emitted pure ESM, so dynamic requires crashed at runtime.
- **Fix**:
  - Replaced the inline esbuild CLI call with `scripts/build-server.mjs`, using the JS API so we can inject a banner safely on Windows shells.
  - Banner defines CommonJS shims:
    ```js
    import pathModule from "node:path";
    import { fileURLToPath as fileURLToPathShim } from "node:url";
    import { createRequire as createRequireShim } from "node:module";
    const require = globalThis.require ?? createRequireShim(import.meta.url);
    const __filename = globalThis.__filename ?? fileURLToPathShim(import.meta.url);
    const __dirname = globalThis.__dirname ?? pathModule.dirname(__filename);
    ```
  - Marked `lightningcss` and `vite` as externals so esbuild doesn’t inline them (Vite shouldn’t load in production).

## 2. Windows CLI Quote Stripping
- **Symptom**: `npm run build` failed with `X [ERROR] Must use "outdir" when there are multiple input files` and the banner never applied. PowerShell stripped the double quotes inside the `--banner:js='...'` argument, mangling the script.
- **Fix**: Switched to `node scripts/build-server.mjs` so we call esbuild’s JS API, avoiding shell quoting issues entirely.

## 3. Duplicate Identifier Errors (`path`, `fileURLToPath`)
- **Symptom**: After the banner change, runtime errors like `Identifier 'path' has already been declared` and `Identifier 'fileURLToPath' has already been declared`.
- **Root Cause**: Esbuild also imported `node:path`/`node:url` elsewhere, so the banner’s `import path from "path"` collided.
- **Fix**: Aliased imports (`pathModule`, `fileURLToPathShim`) and wrapped global definitions (`globalThis.require ?? ...`) to avoid redeclarations.

## 4. Missing `DATABASE_URL` in Production Bundle
- **Symptom**: `Error: DATABASE_URL must be set...` at runtime despite `.env` containing the value.
- **Root Cause**: `server/db.ts` was evaluated before `dotenv.config()` in `server/index.ts`, because the bundled order changed. Without a manual import, env vars weren’t loaded when `db.ts` executed.
- **Fix**:
  - Added `server/env.ts` (just `dotenv.config()` once) and imported it at the top of `server/db.ts`.
  - `server/index.ts` still runs `dotenv.config()` for completeness, but DB initialization now works even inside the bundle.

## 5. Vite Package Access in Production
- **Symptom**: After resolving DB issues, prod bundle tried to import Vite, which in turn tried to read `C:\Users\User\project\package.json`, causing `ENOENT` when run from `AwashRiskDashboard`.
- **Root Cause**: `server/index.ts` imported `setupVite`/`serveStatic` eagerly, so esbuild bundled Vite’s dev server even for production builds.
- **Fix**:
  - Replaced static imports with dynamic imports inside the `if (process.env.NODE_ENV === "development")` block.
  - Updated `server/vite.ts` to dynamically import `vite` within `setupVite`.
  - Marked `vite` as external in `scripts/build-server.mjs` so the prod server never bundles dev-only tooling.

## 6. Build/Run Workflow Verification
- After the above patches, the happy path is:
  1. `npm install`
  2. `.env` populated with at least `DATABASE_URL`, `PORT`, `JWT_SECRET`
  3. `npm run build`
  4. `npm start`
- The `dotenv` banner log confirms env values load, and the Express logger reports `serving on port ...`.

## 7. User Creation Failing (`passwordHash` required)
- **Symptom**: POST `/api/users` returned 400 with Zod errors complaining `passwordHash` was required, causing admin-user creation to fail.
- **Root Cause**: The route reused `insertUserSchema`, which expects a `passwordHash`. The UI sends a plaintext `password`, so validation failed before hashing.
- **Fix**:
  - Added a dedicated `createUserInputSchema` (email, name, password, role, department).
  - Updated `/api/users` POST handler to parse the new schema, hash `payload.password`, and pass `passwordHash` to storage.
  - Result: admin UI can create users without manual hashing, while storage still enforces hashed values.

## 8. Password Length Validation Too Strict
- **Symptom**: Admin UI still hit 400 errors (`min 8 character` Zod error) when creating users with short test passwords.
- **Root Cause**: New validation required password length ≥ 8 while UI allowed any length, so shorter inputs were rejected server-side without clear guidance.
- **Fix**:
  - Relaxed backend password rule to minimum 6 characters to match UX needs.
  - Added `minLength={6}` on the Admin password input so the browser enforces the same rule before submission.
  - Documented this behavior so future changes keep client/server validation aligned.

## 9. Imported Risk Records Defaulting to "Unknown"
- **Symptom**: After uploading a CSV exported from the app, approved records showed `riskType = "Unknown"` and other defaults like `businessUnit = "General"`.
- **Root Cause**: `approveStagingData` only recognized exact camelCase/snake_case keys (e.g., `riskType`, `risk_type`). Exported sheets (e.g., `Risk Type`, `Business Unit`) didn’t match, so fallback values were used.
- **Fix**:
  - Added helper functions to normalize incoming keys (case-insensitive, spaces/underscores removed) and look up values via alias lists (`type`, `risk`, `Risk Type`, etc.).
  - Now uploads are resilient to capitalization/spacing differences, and the approved records keep the user-provided values.

## 10. Residual Risk Field Rejecting Numeric Input
- **Symptom**: Creating or editing a risk record failed because `residualRisk` was treated as a string in the schema while the UI uses a numeric input.
- **Root Cause**: `insertRiskRecordSchema` didn’t coerce optional numeric fields, so Zod expected strings. Passing numbers triggered validation errors.
- **Fix**:
  - Updated the schema to coerce `inherentRisk`, `residualRisk`, and `riskScore` to numbers (while allowing null/optional values).
  - The risk form now saves numeric residual/inherent scores without manual conversions.

## 11. High-Likelihood Risks Showing as Low on Dashboard
- **Symptom**: Risks entered as 100% likelihood/impact appeared as “Low Risk” in dashboard stats.
- **Root Cause**: `getRiskStatistics` classified risks solely by the `inherentRisk` column. Imported records defaulted that field to 25 when not provided, so even high likelihood/impact entries were counted as low.
- **Fix**:
  - Added `calculateRiskScore()` helper that uses `inherentRisk` when available, otherwise derives `likelihood * impact / 100`.
  - Updated the stats aggregation to use this derived score, so risk severity now reflects the entered numbers even if `inherentRisk` wasn’t explicitly stored.

### Lessons Learned / Tips
- When bundling Node backends as ESM, always inject CommonJS shims and treat dev-only packages as externals.
- Run `dotenv.config()` before any module that consumes env vars to avoid race conditions in bundles.
- On Windows shells, prefer JS-driven build scripts instead of heavy inline CLI arguments.
- Maintain this log; every resolved issue becomes future documentation for you and your teammates.

