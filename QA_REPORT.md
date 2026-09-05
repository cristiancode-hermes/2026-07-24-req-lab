# QA Report — 2026-07-24 ReqLab

**Project:** ReqLab — Web-Based HTTP API Client (Postman-like)
**Stack:** Angular 22 + NestJS 11 + SQLite (better-sqlite3) + TypeORM
**Author:** Hermes Daily Builder

## ✅ 1. Build Verification

| Target | Status | Details |
|--------|--------|---------|
| API TypeScript build | ✅ PASS | `npx tsc -p tsconfig.build.json` — exit 0 |
| Angular web build | ✅ PASS | `ng build` — exit 0, 6 warnings (unused imports only) |
| API dist/main.js | ✅ PRESENT | 1,127 bytes, all modules compiled |
| Web dist/browser/ | ✅ PRESENT | 252KB main.js, 37KB styles.css, index.html |

## ✅ 2. Test Results

Functional tests executed:

| Endpoint | Method | Status | Details |
|----------|--------|--------|---------|
| `/api/auth/register` | POST | ✅ PASS | Returns `{token, user}` with JWT |
| `/api/auth/login` | POST | ✅ PASS | Returns `{token, user}` with correct credentials |
| `/api/auth/me` | GET | ✅ PASS | Returns user profile with valid Bearer token |
| `/api/docs-json` | GET | ✅ PASS | 15+ API paths documented |
| `/api/workspaces` | GET | ✅ PASS | Returns demo workspace |
| `/api/collections` | GET | ✅ PASS | Returns seeded collections with requests |

Auth flow validated end-to-end: register → store token → authenticate → access protected routes.

## ✅ 3. API Server Verification

| Check | Status | Details |
|-------|--------|---------|
| Server startup | ✅ PASS | NestJS started on port 3044 |
| Database seeding | ✅ PASS | Demo user (`demo@reqlab.dev`), workspace, collections, requests seeded |
| CORS | ✅ PASS | Enabled for all origins |
| Swagger UI | ✅ PASS | Available at `/api/docs` |
| URI versioning | ✅ NOT USED | `setGlobalPrefix('api')` without versioning |

## ✅ 4. Quality Audit

| Criterion | Verdict | Notes |
|-----------|---------|-------|
| Project structure | ✅ PASS | `apps/api`, `apps/web`, `docs/` present |
| Documentation | ✅ PASS | ARCHITECTURE.md, API.md, FRONTEND.md in `docs/` |
| Auth flow | ✅ PASS | JWT-based register/login/me with bcrypt passwords |
| DTO validation | ✅ PASS | class-validator decorators on RegisterDto, LoginDto |
| Environment config | ✅ PASS | `.env` with JWT_SECRET, DATABASE_PATH, PORT, SEED_DB |

### Minor Issues

| Issue | Severity | Suggestion |
|-------|----------|------------|
| TypeORM entity column types inferred as `Object` | Minor | Fixed both `HistoryEntry.requestId` and `CollectionShare.expiresAt` with explicit `type` |
| No unit tests in source | Minor | Consider adding Jest tests for AuthService, SeedService |
| Angular unused imports warnings | Minor | 6 unused component imports — clean up for production readiness |

## ✅ 5. Security Scan

| Check | Result |
|-------|--------|
| `password` field in RegisterDto | ✅ `@MinLength(6)` validated |
| JWT secret in `.env` | ⚠️ Dev-only (`dev-secret-change-in-production`) |
| CORS wide open | ℹ️ Acceptable for dev/deployment |
| No hardcoded secrets in source | ✅ PASS |

## ✅ 6. Deployment

| Target | Result | Details |
|--------|--------|---------|
| Caddy subdomain | ✅ DEPLOYED | `https://reqlab.proyectos.cristiancode.dev` → HTTP 200 |
| API reverse proxy | ✅ DEPLOYED | Port 3044 mapped via `/api*` path |
| Excel tracker | ✅ UPDATED | Row 57 — ReqLab, Full Stack |
| Landing page | ✅ UPDATED | Added `reqlab` to Social category |

## ✅ 7. C++ Project: proc-manager

| Check | Status | Details |
|-------|--------|---------|
| CMake build | ✅ PASS | `libprocman-lib.a` + `proc-manager` binary |
| Binary execution | ✅ PASS | `--help`, `--json` produce valid output |
| Test suite | ✅ PASS | 12 test cases, 48 assertions — ALL PASSED |
| Excel tracker | ✅ DONE (pre-populated) | Row 55 — proc-manager |
| Landing page | ✅ UPDATED | Added `proc-manager` to C++ / Sistemas category |

## Summary

**OVERALL: PASS ✅**

| Project | Build | Tests | Deployed |
|---------|-------|-------|----------|
| **ReqLab** (Full-Stack) | ✅ | ✅ Functional | ✅ reqlab.proyectos.cristiancode.dev |
| **proc-manager** (C++) | ✅ | ✅ 12/12 (48 assertions) | — (CLI tool) |
