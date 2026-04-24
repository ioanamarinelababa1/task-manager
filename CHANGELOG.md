# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] — 2026-04-24

### Added
- Task fields: `priority` (LOW / MEDIUM / HIGH), `dueDate`, `category`
- Refresh token rotation — each token is single-use; old token revoked on every refresh
- TypeORM migrations replacing `synchronize: true` in production (`migration:generate`, `migration:run`, `migration:revert`)
- Pino structured logging with sensitive field redaction
- Dependabot configuration for automated weekly dependency vulnerability scans
- Docker and `docker-compose` for local development environment parity
- Bearer token fallback for iOS Safari cross-domain cookie blocking
- Branch protection rules with required CI checks before merge
- 38 unit tests (up from 9) covering ownership enforcement and security boundaries
- Coverage: `auth.service` 94.6%, `tasks.service` 81.6%
- Open source contribution setup: issue templates, PR template, ROADMAP.md
- 5 GitHub Issues labelled `good first issue`
- Live deployment: frontend on Vercel, backend on Railway
- Swagger UI available at the production URL

### Fixed
- iOS Safari authentication loop caused by cross-domain cookie blocking
- TypeORM migrations path resolution in production (`dist/migrations`)
- ESLint `no-unsafe-assignment` and `no-unsafe-member-access` errors in test files
- Cookie `sameSite` configuration for cross-domain production authentication

### Removed
- Google OAuth 2.0 references (feature was never implemented)
- `synchronize: true` in production (replaced by versioned migrations)

---

## [0.1.0] — 2026-04-17

### Added

#### Backend (NestJS)
- NestJS application bootstrapped with `@nestjs/cli`
- TypeORM integration with PostgreSQL — `Task` and `User` entities
- Full CRUD REST API for tasks: `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`
- JWT authentication with access tokens (15 min) and refresh tokens (7 days)
- Passwords hashed with `bcryptjs` (10 salt rounds)
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` endpoints
- Input validation with `class-validator` and `class-transformer` — global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`)
- DTOs for all inputs: `CreateTaskDto`, `UpdateTaskDto`, `RegisterDto`, `LoginDto`
- Rate limiting with `@nestjs/throttler` — 60 req/min tasks, 10 req/min auth, 5 req/min login
- Security headers via `helmet` (X-Content-Type-Options, X-Frame-Options, HSTS, CSP)
- httpOnly cookie storage for access and refresh tokens
- `SameSite: strict` cookie policy
- Global exception filter — consistent error shape, no stack trace leakage
- CORS hardening — explicit origin, methods, headers, `credentials: true`
- Swagger UI at `/api` with Bearer auth support
- User-specific tasks with ownership enforcement (403 Forbidden cross-user)
- CI/CD GitHub Actions with parallel backend and frontend jobs
- Dependency vulnerability review on Pull Requests
- Unit tests for TasksService and AuthService (9 tests passing)
- CONTRIBUTING.md and SECURITY.md documentation

#### Frontend (Next.js)
- Next.js 15 with App Router and Tailwind CSS
- Task board with status badges (TODO, IN_PROGRESS, DONE)
- Stats bar with task counts per status
- Create, edit, delete task modals
- Toast notifications
- Login and register pages
- Loading skeletons and error states

### Security
- Security audit completed — 10/10 checks passed
- SQL injection protection via TypeORM parameterised queries
- No sensitive data returned in response bodies

---

[0.2.0]: https://github.com/ioanamarinelababa1/task-manager/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ioanamarinelababa1/task-manager/releases/tag/v0.1.0
