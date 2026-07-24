# ReqLab Architecture

## Overview

ReqLab is a **Postman-like HTTP API client** — a full-stack web application for building, testing, and sharing API requests.

**Tech Stack:**
- **Frontend:** Angular 22 (standalone, zoneless, signals)
- **Backend:** NestJS 11 (TypeORM, JWT auth)
- **Database:** SQLite (dev) / PostgreSQL/Neon (production)
- **Styling:** Tailwind CSS v4

## Project Structure

```
req-lab/
├── apps/
│   ├── api/              # NestJS backend
│   │   └── src/
│   │       ├── auth/         # JWT authentication
│   │       ├── users/        # User management
│   │       ├── workspaces/   # Workspace CRUD
│   │       ├── collections/  # Collection hierarchy (tree with parentId)
│   │       ├── requests/     # HTTP request definitions
│   │       ├── environments/ # Environment variables
│   │       ├── proxy/        # Proxy for executing HTTP requests server-side
│   │       ├── history/      # Request execution history
│   │       ├── share/        # Collection sharing via links
│   │       ├── import-export/ # Postman JSON import/export
│   │       └── seed/         # Demo data seeding
│   └── web/              # Angular 22 frontend
│       └── src/
│           ├── app/
│           │   ├── guards/       # Auth guards
│           │   ├── interceptors/ # HTTP interceptors (JWT injection)
│           │   ├── interfaces/   # TypeScript entity interfaces
│           │   ├── layouts/      # Page layouts (workspace)
│           │   ├── pages/        # Route pages (login, register, dashboard)
│           │   ├── services/     # API services (auth, workspace, etc.)
│           │   └── shared/       # Reusable components
│           └── main.ts
├── scripts/
│   └── build-css.js      # Tailwind v4 CSS pre-processor
└── docs/
    ├── ARCHITECTURE.md
    ├── API.md
    └── FRONTEND.md
```

## Architecture Decisions

1. **Server-side proxy**: All HTTP requests created in the frontend are proxied through the NestJS backend to avoid CORS restrictions. The `/api/proxy` endpoint accepts a method, URL, headers, and body, executes the actual HTTP request server-side, and returns the response with timing.

2. **Self-referencing collections**: Collections support nested folders via a nullable `parentId` foreign key. The frontend builds a tree structure from the flat list returned by the API.

3. **Environment variables**: Variables defined in environments use `{{variableName}}` syntax in URLs, headers, and bodies. The frontend resolves these before sending through the proxy.

4. **JWT authentication**: Passport JWT strategy with 7-day token expiration. Tokens stored in localStorage on the frontend.
