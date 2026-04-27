# Task Manager

Task Manager is a production-ready full-stack starter built with NestJS, PostgreSQL and Next.js. Everything you need is already configured: JWT authentication with refresh token rotation, TypeORM migrations, Docker, GitHub Actions CI/CD, and a 10/10 security audit. Clone it, run docker-compose up, and start building your feature — not your infrastructure.

[![CI](https://github.com/ioanamarinelababa1/task-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/ioanamarinelababa1/task-manager/actions/workflows/ci.yml)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red)](https://github.com/ioanamarinelababa1/task-manager)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

## Live Demo

> Live demo: [task-manager-zeta-sepia.vercel.app](https://task-manager-zeta-sepia.vercel.app)
> A GIF demo is coming soon — contributions welcome!

## Quick Start

```bash
git clone https://github.com/ioanamarinelababa1/task-manager.git
cd task-manager
cp backend/.env.example backend/.env  # add your DATABASE_URL and JWT secrets
docker-compose up --build
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Swagger UI: http://localhost:3001/api
```

## What's Already Built For You

Everything in this list is production-ready and tested — you don't need to build it:

| Feature | Details |
|---------|---------|
| JWT Auth | Register, login, logout, refresh token rotation with DB revocation |
| Security | Helmet, CORS, rate limiting, httpOnly cookies, XSS sanitization, clickjacking protection |
| Database | PostgreSQL with TypeORM, migrations in production, synchronize in development |
| Testing | 38 tests — ownership enforcement, security boundaries, auth flows |
| CI/CD | GitHub Actions — TypeScript, ESLint, Jest, build checks on every push |
| Docker | docker-compose up starts everything — no local Node.js setup required |
| API Docs | Swagger UI auto-generated from decorators |
| Error handling | Global exception filter, consistent error shape, no stack trace leakage |

## Why Task Manager?
Most people struggle with keeping track of what needs to be done, what's in progress, 
and what's completed. Task Manager solves this by providing a simple but powerful 
system to organize work with real-time status tracking — moving tasks from TODO → 
IN_PROGRESS → DONE with full control over every entry.

## What makes it different?
- Production-grade from day one — no "I'll add auth later" technical debt
- Migrations not synchronize — safe to deploy with real data immediately
- Docker included — works on any machine with one command
- Security audit passed — Helmet, rate limiting, XSS protection, httpOnly cookies
- 38 real tests — not the NestJS defaults, actual security boundary verification
- Open source with templates — Issues, PRs, branch protection already configured

## Features
- ✅ Full CRUD for tasks (Create, Read, Update, Delete)
- ✅ Status badges (TODO / IN_PROGRESS / DONE)
- ✅ Stats bar with task counts per status
- ✅ Empty state with inline create prompt
- ✅ Loading skeletons while fetching data
- ✅ Error handling with retry action
- ✅ Toast notifications on create, update, and delete
- ✅ Responsive 3-column grid layout
- ✅ RESTful API with NestJS controllers and services
- ✅ PostgreSQL database with TypeORM migrations (synchronize:false in production)
- ✅ JWT authentication with bcrypt password hashing
- ✅ User-specific tasks — each user sees only their own tasks
- ✅ 403 Forbidden on unauthorized task access
- ✅ Live deployment — frontend on Vercel, backend on Railway
- ✅ Docker support — full stack via docker-compose up
- ✅ 38 automated tests — ownership enforcement and security boundary coverage
- ✅ iOS Safari auth fix — Bearer token fallback for cross-domain cookies

## Screenshots

### Task Board
The main view renders all tasks as cards in a responsive grid (1 column on mobile, 2 on tablet, 3 on desktop). Each card displays the task title, an optional description, a colored status badge, and the creation date. Edit and delete action buttons appear on hover.

### Status Badges
Three distinct color schemes make status immediately scannable at a glance:

| Status | Color |
|--------|-------|
| ● To Do | Gray — `bg-gray-100 text-gray-600` |
| ● In Progress | Blue — `bg-blue-50 text-blue-700` |
| ● Done | Green — `bg-green-50 text-green-700` |

### Stats Bar
Sits below the header when at least one task exists. Shows the total task count alongside per-status breakdowns with live badges. A **Refresh** button re-fetches from the API without a full page reload.

### New Task / Edit Modal
Clicking **New Task** or the pencil icon on a card opens a modal with:
- Title field (required)
- Description textarea (optional)
- Status dropdown (TODO / IN PROGRESS / DONE)
- Cancel and Save/Create buttons with a loading spinner while the request is in flight
- Inline error message if the API call fails

### Delete Confirmation
Clicking the trash icon opens a focused confirmation dialog that shows the task title and requires an explicit **Delete** click before removing it — preventing accidental deletions.

### Empty State
When no tasks exist, the board shows a centered illustration with a **Create your first task** button so users are never left staring at a blank screen.

### Loading Skeletons
Six animated skeleton cards are shown while the initial fetch is in flight, preserving layout stability and eliminating layout shift.

### Toast Notifications
A bottom-center toast slides in on every successful create, update, or delete action and auto-dismisses after 3 seconds.

## Why This Architecture?

Every decision in this project was made deliberately, not by default.

**Separated frontend and backend** — keeping them as independent services mirrors how real production systems are built. The API can be consumed by a mobile app, a CLI, or a third-party client without touching the frontend. It also means each service can be deployed, scaled, and debugged independently.

**NestJS over Express** — Express gives you full freedom, which in practice means every developer structures things differently. NestJS enforces modules, controllers, and services from the start — the same pattern used in enterprise Java (Spring) and .NET applications. The structure is the feature.

**TypeORM over raw SQL** — database logic lives in TypeScript classes with decorators instead of string queries. The schema is version-controlled alongside the code, TypeScript catches type mismatches at compile time, and switching databases requires changing one config line rather than rewriting every query.

**Next.js for the frontend** — it is the industry standard for React applications. File-based routing, server components, built-in optimisation, and first-class TypeScript support are all included without configuration. Starting with Next.js means the frontend is already production-ready.

**PostgreSQL on Supabase** — production-grade relational database, hosted in the cloud, free to start, no local Docker setup required. The connection string is the only thing that changes between development and production.

**JWT authentication** — security is non-negotiable even in small projects. Stateless tokens mean the backend does not need to store sessions, any server instance can validate a request, and the frontend simply attaches a header to every call. Building it early also means every subsequent feature is built with auth in mind from day one.

**Tailwind CSS** — utility classes eliminate the context-switching between TypeScript and CSS files. Styles live next to the markup they describe, there is no naming convention to invent, and the output is automatically purged to the minimum bytes needed.

## What I Learned

- Building a REST API from scratch with NestJS — understanding modules, dependency injection, guards, and decorators rather than just writing functions
- Connecting a cloud PostgreSQL database with TypeORM — entity definitions, repository pattern, and using TypeORM migrations in production (`synchronize: false`) with `synchronize: true` only in development for fast iteration
- Implementing JWT authentication with password hashing — the full cycle of registration (bcrypt hash), login (compare + sign), and route protection (Passport strategy + guard)
- Managing a Git workflow with conventional commits — keeping history readable so every change has a clear reason attached to it
- Handling CORS between separate frontend and backend services — understanding why the browser blocks cross-origin requests and how `enableCors()` at the NestJS bootstrap level resolves it
- Debugging real connection issues — DNS resolution failures, port conflicts, and authentication errors are not abstract concepts anymore; they are problems with specific error messages and specific fixes
- Difference between authentication and authorization — JWT proves who you are, ownership checks prove what you can access
- Setting up CI/CD with GitHub Actions — automated TypeScript, ESLint, Jest and build checks on every push

## Challenges & Solutions

**Supabase direct connection not resolving (`ENOTFOUND`)**
The default direct connection URL (`db.<project>.supabase.co`) uses a hostname that is not publicly resolvable from all network environments. Switching to the Session Pooler URL (`aws-0-<region>.pooler.supabase.com`) routes through Supabase's connection pooler, which resolves consistently from any environment including local machines and CI.

**CORS blocking frontend requests**
The browser refused every request from `localhost:3000` to `localhost:3001` because the backend did not declare which origins it accepts. Adding `app.enableCors({ origin: 'http://localhost:3000' })` in `main.ts` before `app.listen()` tells NestJS to include the correct `Access-Control-Allow-Origin` header, and the browser allows the request through.

**Port conflict between Next.js and NestJS**
Both services defaulted to port 3000. The fix was explicit: `await app.listen(3001)` in `main.ts` for the backend, and `next dev` (which defaults to 3000) left unchanged for the frontend. The `API_BASE` constant in the frontend then points to `http://localhost:3001` to match.

**iOS Safari authentication loop**
iOS Safari's Intelligent Tracking Prevention (ITP) blocks cross-domain `Set-Cookie` headers. Since the frontend (vercel.app) and backend (railway.app) are on different domains, Safari never stores the httpOnly cookie, causing every request to appear unauthenticated. Fix: return `access_token` in the login response body as a fallback, store it in `sessionStorage`, and send it as an `Authorization: Bearer` header. The NestJS JWT strategy accepts both the cookie and the Bearer header transparently, so all other browsers continue using the secure httpOnly cookie path.

## Tech Stack
| Layer | Technology |
|-------|------------|
| Backend | NestJS, TypeScript |
| ORM | TypeORM with migrations — synchronize:false in production, migrationsRun:true, schema changes are versioned and reversible |
| Database | PostgreSQL (Supabase) |
| Frontend | Next.js 16.2.3, Tailwind CSS v4 |
| Auth | JWT + bcryptjs |
| Deploy | Vercel (frontend) + Railway (backend) |
| Version Control | Git + GitHub |

## Database Migrations
Schema changes are managed through TypeORM migrations, not synchronize.

In production: `synchronize: false` + `migrationsRun: true`
In development: `synchronize: true` for fast iteration

Available commands:
```
npm run migration:generate  # Generate migration from entity changes
npm run migration:run       # Apply pending migrations
npm run migration:revert    # Rollback last migration
```

Current migrations:
- `Migration1776592549839` — initial schema (task, users tables)
- `AddRefreshTokens1776596439463` — refresh_tokens table with revocation

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | Get all tasks |
| GET | /tasks/:id | Get task by ID |
| POST | /tasks | Create new task |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |
| POST | /auth/register | Create new account |
| POST | /auth/login | Login, returns JWT cookie |
| POST | /auth/refresh | Refresh token rotation |
| POST | /auth/logout | Revoke all refresh tokens |
| GET | /auth/me | Get current user |

## API Documentation

Interactive API documentation is available via Swagger UI.
https://task-manager-production-e05a.up.railway.app/api

**What you can do in Swagger:**
- Browse all available endpoints with descriptions
- See request body schemas and required fields
- Test endpoints directly from the browser
- Authenticate with JWT using the Authorize button (top right)
- View all possible response codes and formats

**Authentication in Swagger:**
1. Call `POST /auth/register` to create an account
2. Call `POST /auth/login` to get a token
3. Click the **Authorize** button (top right)
4. Enter: `Bearer <your_token>`
5. All protected routes are now unlocked

## Getting Started

The app is live — visit the [Live Demo](#live-demo) links above to try it immediately, or run it locally using the instructions below.

### Prerequisites (local development only)
- Node.js 20.x or higher
- npm
- A Supabase account (free tier works)

### Run locally
```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Backend runs on: http://localhost:3001  
Frontend runs on: http://localhost:3000

## Docker

Run the entire stack with one command:

```bash
docker-compose up --build
```

This starts both services with the same configuration used in production, ensuring dev/prod parity — no "works on my machine" issues.

> **Note:** Docker is for local development only. Production uses Railway (backend) and Vercel (frontend) with automatic deploys from GitHub.

## Project Structure
```
task-manager/
├── backend/              # NestJS API
│   └── src/
│       ├── auth/         # JWT auth, register, login, refresh, logout
│       ├── tasks/        # Tasks CRUD with ownership enforcement
│       ├── migrations/   # TypeORM migrations for production
│       └── app.module.ts
└── frontend/             # Next.js UI
    └── app/
        ├── components/   # TaskCard, TaskModal, DeleteModal, StatusBadge
        ├── lib/          # API client, TypeScript types
        ├── icon.svg      # Purple notebook favicon
        └── page.tsx
```

## How to Extend This Project

This project is designed to be a starting point, not a finished product.

**Add a new feature (example: comments on tasks):**
1. Create the entity: `src/comments/comment.entity.ts`
2. Generate module: `npx @nestjs/cli generate module comments`
3. Generate controller and service: `nest g controller comments && nest g service comments`
4. Generate migration: `npm run migration:generate`
5. Add frontend component in `frontend/app/components/`

**Add a new page (frontend):**
- Pages live in `frontend/app/` — create a folder with `page.tsx`
- API calls go in `frontend/app/lib/api.ts`
- Types go in `frontend/app/lib/types.ts`

**Swap the database:**
- Change the TypeORM driver in `app.module.ts`
- Update `DATABASE_URL` in `.env`
- Regenerate migrations

## Contributing

Contributions are welcome! Task Manager is open source and accepts PRs at all difficulty levels.

- Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide: local setup, branch naming, commit conventions, and PR process.
- Browse [ROADMAP.md](./ROADMAP.md) for ideas — the v0.3.0 items are all good first issues.
- Found a bug? [Open a bug report](.github/ISSUE_TEMPLATE/bug_report.md). Have an idea? [Open a feature request](.github/ISSUE_TEMPLATE/feature_request.md).

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full plan. Highlights:

| Version | Theme | Examples |
|---|---|---|
| v0.3.0 | UI/UX | Dark mode, filters, search, sort |
| v0.4.0 | Features | Comments, file attachments, recurring tasks |
| v0.5.0 | Collaboration | Shared workspaces, task assignment, real-time updates |
| v0.6.0 | Integrations | CSV export, calendar view, Slack, GitHub sync |

## Author
Ioana-Marinela Baba  
GitHub: github.com/ioanamarinelababa1
