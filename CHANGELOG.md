# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] — 2026-04-24

### Added

#### Backend (NestJS)
- Task fields: `priority` (LOW/MEDIUM/HIGH, default MEDIUM), `dueDate` (optional), `category` (optional, max 50 chars)
- Refresh token rotation with database storage — tokens hashed with bcrypt, revoked on logout and after each use
- TypeORM migrations replacing `synchronize` in production (`migration:generate`, `migration:run`, `migration:revert`)
- Pino structured logging with sensitive field redaction (`authorization`, `password`, `token`)
- Dependabot configured for weekly automated dependency vulnerability updates (backend, frontend, GitHub Actions)
- Bearer token fallback for iOS Safari cross-domain cookie blocking (ITP workaround)
- Docker and docker-compose for local development environment parity

#### Frontend (Next.js)
- Priority badge on task cards (LOW=gray, MEDIUM=yellow, HIGH=red)
- Due date and category fields in task create/edit modal
- Bearer token sent via sessionStorage as fallback when cookies are blocked (iOS Safari)

#### Testing
- 38 automated tests (up from 9)
- Ownership enforcement tests: ForbiddenException on cross-user findOne/update/remove
- Data isolation tests: user cannot read or delete another user's tasks
- Edge case tests: NotFoundException, empty results, default status
- Auth security tests: password hashing verified, wrong credentials rejected, refresh token rotation confirmed
- Coverage: auth.service.ts 94.6% statements / 97% lines, tasks.service.ts 81.6%

#### DevOps & Open Source
- Live deployment: frontend on Vercel, backend on Railway
- Swagger UI live at production URL
- Branch protection with required CI checks before merge
- GitHub Issue templates: feature_request.md, bug_report.md
- Pull Request template with checklist
- ROADMAP.md with versioned feature plan
- 5 open Issues tagged `good first issue`

### Fixed
- iOS Safari authentication loop caused by cross-domain cookie blocking (ITP)
- TypeORM migrations glob path in production (was resolving to wrong directory)
- ESLint errors in test files (unsafe-any, prettier formatting)
- Cookie `sameSite` configuration for cross-domain production auth

### Removed
- `synchronize: true` in production — replaced by TypeORM migrations
- Google OAuth 2.0 references — feature was planned but not implemented

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
- 9 unit tests for TasksService and AuthService
- CONTRIBUTING.md, SECURITY.md, CHANGELOG.md documentation

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
