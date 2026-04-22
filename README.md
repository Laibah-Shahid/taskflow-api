# TaskFlow

A full-stack task management application with JWT-secured, user-scoped CRUD operations. Built with **.NET 9** on the backend and **Angular 21** on the frontend, backed by **MySQL 8**, and fully containerized with Docker Compose.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Local Development](#local-development)
  - [Backend (TaskFlow.Api)](#backend-taskflowapi)
  - [Frontend (taskflow-web)](#frontend-taskflow-web)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database & Migrations](#database--migrations)
- [Authentication](#authentication)
- [Testing](#testing)
- [Production Notes](#production-notes)
- [Troubleshooting](#troubleshooting)

---

## Overview

TaskFlow is a reference implementation of a modern, containerized web application. Each user authenticates via JWT and manages their own private list of tasks with status, priority, and due-date tracking. The codebase is split into two deployable units — a stateless ASP.NET Core Web API and an Angular single-page application served via Nginx — orchestrated together through Docker Compose.

## Features

- JWT-based authentication with per-user data isolation
- Task CRUD with status (`Todo` / `InProgress` / `Completed`), priority (`Low` / `Medium` / `High`), and due dates
- Automatic `CompletedAt` timestamp tracking on status transitions
- Client-side filtering with live counts (All / Todo / In Progress / Completed)
- Overdue task highlighting via a custom directive and a time-until-due pipe
- Toast notifications for CRUD feedback
- Swagger / OpenAPI documentation for the API
- Auto-applied EF Core migrations on API startup
- Demo user seeded on first boot for quick evaluation

## Tech Stack

| Layer       | Technology                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| Backend     | .NET 9, ASP.NET Core Web API, EF Core 9, ASP.NET Identity, Swashbuckle     |
| Frontend    | Angular 21 (standalone components, Signals), TypeScript 5.9, RxJS 7.8      |
| Database    | MySQL 8.0 (via Pomelo EF Core provider)                                    |
| Auth        | JWT Bearer tokens (`System.IdentityModel.Tokens.Jwt`)                      |
| Container   | Docker, Docker Compose, multi-stage builds, Nginx (frontend runtime)       |
| Tooling     | Angular CLI, Vitest, Prettier, EF Core CLI                                 |

## Architecture

```
        ┌────────────────┐         ┌────────────────┐         ┌────────────────┐
        │   Browser      │  HTTPS  │   Angular SPA  │  JSON   │  .NET Web API  │
        │   (client)     │ ──────▶ │   (Nginx:80)   │ ──────▶ │   (Kestrel)    │
        └────────────────┘         └────────────────┘         └───────┬────────┘
                                                                      │ EF Core
                                                                      ▼
                                                              ┌────────────────┐
                                                              │   MySQL 8.0    │
                                                              └────────────────┘
```

- The SPA calls the API at `/api/*` over HTTP; in development CORS is opened for `http://localhost:4200`.
- The API is stateless — sessions are encoded into signed JWTs and validated on every request.
- Every task query is filtered by the `NameIdentifier` claim, enforcing per-user data isolation at the controller layer.

---

## Prerequisites

**For the Docker path (recommended):**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 4.x or later (Compose v2)

**For local development:**
- [.NET SDK 9.0.313](https://dotnet.microsoft.com/download) (pinned via `TaskFlow.Api/global.json`)
- [Node.js 20.x LTS](https://nodejs.org/) with npm 10.9+
- [MySQL 8.0](https://dev.mysql.com/downloads/mysql/) running locally, or a reachable instance
- [EF Core CLI](https://learn.microsoft.com/ef/core/cli/dotnet): `dotnet tool install --global dotnet-ef`

---

## Quick Start (Docker)

The fastest way to get the full stack running.

```bash
# 1. From the repository root
docker compose up --build
```

Once the stack is healthy:

| Service | URL                             |
| ------- | ------------------------------- |
| Web app | http://localhost:4200           |
| API     | http://localhost:5178           |
| Swagger | http://localhost:5178/swagger (only in `Development`) |
| MySQL   | `localhost:3307` (host port)    |

The API applies pending migrations and seeds a demo user automatically on first launch. Credentials are defined in [TaskFlow.Api/appsettings.json](TaskFlow.Api/appsettings.json) under the `SeedUser` section — use those to log in at http://localhost:4200/login.

To stop the stack:

```bash
docker compose down           # stop containers
docker compose down -v        # stop and delete the mysql-data volume
```

---

## Local Development

### Backend (TaskFlow.Api)

```bash
cd TaskFlow.Api

# Restore and build
dotnet restore
dotnet build

# Run (listens on https://localhost:7xxx and http://localhost:5178 by default)
dotnet run
```

Point the API at your MySQL instance by editing `ConnectionStrings:DefaultConnection` in [TaskFlow.Api/appsettings.Development.json](TaskFlow.Api/appsettings.Development.json), or set the `Jwt:Key` and connection string as environment variables (see [Environment Variables](#environment-variables)).

Migrations run automatically on startup, so a fresh, empty database is all that's required. Swagger is exposed at `/swagger` when `ASPNETCORE_ENVIRONMENT=Development`.

### Frontend (taskflow-web)

```bash
cd taskflow-web

npm install
npm start        # ng serve on http://localhost:4200
```

Available scripts (from [taskflow-web/package.json](taskflow-web/package.json)):

| Script          | Description                                   |
| --------------- | --------------------------------------------- |
| `npm start`     | Dev server with HMR on port 4200              |
| `npm run build` | Production build into `dist/`                 |
| `npm run watch` | Incremental dev build, file-watch mode        |
| `npm test`      | Unit tests via Vitest                         |

The API base URL is read from the environment files at [taskflow-web/src/environments/](taskflow-web/src/environments/). Update `apiUrl` there if the backend is not on `http://localhost:5178`.

---

## Project Structure

```
TaskFlow/
├── TaskFlow.Api/                       # .NET 9 Web API
│   ├── Controllers/                    # AuthController, TasksController
│   ├── Data/                           # AppDbContext, DataSeeder
│   ├── Dtos/                           # Request/response contracts
│   ├── Models/                         # Entities, enums (ApplicationUser, TaskItem)
│   ├── Services/                       # JwtTokenService
│   ├── Migrations/                     # EF Core migrations
│   ├── Program.cs                      # Composition root / pipeline
│   ├── appsettings.json                # Default config (incl. SeedUser)
│   ├── Dockerfile                      # Multi-stage SDK-9 -> ASP.NET-9 build
│   └── global.json                     # Pinned .NET SDK version
│
├── taskflow-web/                       # Angular 21 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                   # Guards, interceptors, models, services
│   │   │   ├── features/               # login/, tasks/ (feature components)
│   │   │   └── shared/                 # Directives, pipes, toasts
│   │   ├── environments/               # environment.ts, environment.development.ts
│   │   └── main.ts                     # Bootstrap entry
│   ├── angular.json
│   ├── package.json
│   ├── Dockerfile                      # Multi-stage Node-20 -> Nginx-alpine
│   └── nginx.conf                      # SPA history-fallback config
│
├── docker-compose.yml                  # mysql + api + web
├── .env                                # Dev-only env vars (see note below)
└── .gitignore
```

---

## Environment Variables

The compose stack is configured through [.env](.env) at the repository root. These values are injected into both the MySQL container and the API.

| Variable                  | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `MYSQL_ROOT_PASSWORD`     | Root password for the MySQL container               |
| `MYSQL_DATABASE`          | Database name created on first boot                 |
| `MYSQL_USER`              | Non-root application user                           |
| `MYSQL_PASSWORD`          | Password for `MYSQL_USER`                           |
| `JWT_KEY`                 | Symmetric signing key (must be ≥ 32 chars)          |
| `JWT_ISSUER`              | Expected JWT `iss` claim                            |
| `JWT_AUDIENCE`            | Expected JWT `aud` claim                            |

The API accepts the same values via standard ASP.NET configuration keys when run outside Docker: `ConnectionStrings__DefaultConnection`, `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience`, `Jwt__ExpiryMinutes`.

> The checked-in `.env` contains development-only defaults. **Rotate `JWT_KEY` and all database passwords before deploying anywhere non-local**, and move `.env` out of version control for real environments.

---

## API Reference

Base URL (local): `http://localhost:5178/api`

All task endpoints require `Authorization: Bearer <jwt>`. Tasks are automatically scoped to the authenticated user via the `NameIdentifier` claim.

| Method | Path               | Auth | Description                        |
| ------ | ------------------ | ---- | ---------------------------------- |
| POST   | `/auth/login`      | No   | Exchange credentials for a JWT     |
| GET    | `/auth/me`         | Yes  | Return the current user's profile  |
| GET    | `/tasks`           | Yes  | List the caller's tasks            |
| GET    | `/tasks/{id}`      | Yes  | Get a single task                  |
| POST   | `/tasks`           | Yes  | Create a task                      |
| PUT    | `/tasks/{id}`      | Yes  | Update a task                      |
| DELETE | `/tasks/{id}`      | Yes  | Delete a task                      |

### Task model

```jsonc
{
  "id": 1,
  "title": "Write README",
  "description": "Cover setup, env vars, and API surface",
  "status": "Todo",          // "Todo" | "InProgress" | "Completed"
  "priority": "Medium",      // "Low"  | "Medium"     | "High"
  "dueDate": "2026-05-01T00:00:00Z",
  "completedAt": null,
  "createdAt": "2026-04-22T12:00:00Z"
}
```

Enums are serialized as strings via `JsonStringEnumConverter`. An example request file lives at [TaskFlow.Api/TaskFlow.Api.http](TaskFlow.Api/TaskFlow.Api.http) for use with the VS Code REST client.

Interactive documentation is available at **http://localhost:5178/swagger** when the API is running in `Development`.

---

## Database & Migrations

The API uses EF Core with the Pomelo MySQL provider. Migrations are auto-applied on startup via `db.Database.Migrate()` in [Program.cs](TaskFlow.Api/Program.cs), so the schema is always in sync with the running binary.

Common workflows (run from `TaskFlow.Api/`):

```bash
# Create a new migration after model changes
dotnet ef migrations add <Name>

# Apply migrations manually to a database
dotnet ef database update

# Remove the last (un-applied) migration
dotnet ef migrations remove
```

The Identity tables (`AspNetUsers`, `AspNetRoles`, …) and the `TaskItems` table are all managed through the same `AppDbContext`.

---

## Authentication

1. Client POSTs credentials to `/api/auth/login`.
2. `JwtTokenService` issues a signed JWT embedding the user's id (`NameIdentifier`) and email, valid for `Jwt:ExpiryMinutes` (default 60).
3. The Angular `authInterceptor` attaches `Authorization: Bearer <token>` to every subsequent HTTP call.
4. The API's JWT bearer handler validates issuer, audience, lifetime, and signing key with a 30-second clock skew.
5. `authGuard` redirects unauthenticated users from `/tasks` back to `/login`, and the client auto-logs-out when the stored `expiresAt` passes.

Identity password policy enforced on account creation: minimum 8 characters, with at least one digit, one lowercase, one uppercase, and one non-alphanumeric character. Emails must be unique.

---

## Testing

Frontend unit tests run through Vitest:

```bash
cd taskflow-web
npm test
```

Backend has no test project yet — a future `TaskFlow.Api.Tests` project is the recommended place for controller and service coverage.

---

## Production Notes

Before shipping, harden the defaults:

- Generate a fresh, high-entropy `JWT_KEY` and store it in a secret manager (Azure Key Vault, AWS Secrets Manager, etc.) rather than `.env`.
- Replace the seeded demo user in `appsettings.json` with a proper admin-onboarding flow, or remove the seeder entirely.
- Restrict the CORS policy in [Program.cs](TaskFlow.Api/Program.cs) to the real frontend origin.
- Terminate TLS at a reverse proxy (Traefik, Nginx, Azure Front Door, …) in front of the API.
- Back up the `mysql-data` volume and consider external, managed MySQL instead of the bundled container.
- Swap the Angular `apiUrl` to a build-time variable or a runtime config endpoint so the same image can deploy to multiple environments.

---

## Troubleshooting

**MySQL port 3306 is already in use.**
The host port is deliberately mapped to `3307` in [docker-compose.yml](docker-compose.yml) to avoid clashing with a local MySQL instance. Connect to the containerized database at `localhost:3307`.

**API exits with `Jwt:Key is not configured`.**
The API requires `Jwt__Key` (or `Jwt:Key` in `appsettings.json`). Ensure `.env` is present at the repo root when using Compose, or pass the variable explicitly for local runs.

**Angular can't reach the API / CORS error.**
The backend's CORS policy only allows `http://localhost:4200`. If you serve the SPA from another origin during development, add it to the policy in [Program.cs](TaskFlow.Api/Program.cs).

**Migrations didn't apply.**
Check the API logs — startup migration failures are logged before the app begins listening. Confirm the connection string is reachable from wherever the API is running (inside Compose, use `Server=mysql`; from the host, use `localhost,3307`).

**Login succeeds but subsequent requests return 401.**
The interceptor only runs for requests made through Angular's `HttpClient`. Also verify the token hasn't expired (default 60 minutes) — clearing `taskflow_token` from `localStorage` and logging in again will refresh it.
