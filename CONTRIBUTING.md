# Contributing to Task Manager

Thank you for taking the time to contribute. This guide covers everything you need to get started.

---

## Table of Contents

- [Good first issues](#good-first-issues)
- [Running the project locally](#running-the-project-locally)
- [How to submit a pull request](#how-to-submit-a-pull-request)
- [Branch naming convention](#branch-naming-convention)
- [Commit message convention](#commit-message-convention)
- [PR checklist](#pr-checklist)
- [Code style](#code-style)
- [Running tests](#running-tests)
- [Reporting a security vulnerability](#reporting-a-security-vulnerability)

---

## Good first issues

New to the project? These are well-scoped, self-contained starting points that don't require deep knowledge of the codebase:

| Feature | Where to look | Difficulty |
|---|---|---|
| **Dark mode toggle** | `frontend/app/` — add a `ThemeProvider` and a toggle button in the header | Easy |
| **Filter tasks by status** | `frontend/app/` — add filter buttons above the task grid | Easy |
| **Search tasks by title** | `frontend/app/` — client-side filter on the task list | Easy |
| **Sort tasks by date** | `frontend/app/` — newest/oldest toggle on the task grid | Easy |
| **Character counter on task title** | `frontend/app/components/` — show remaining characters in the create/edit modal | Easy |

See [ROADMAP.md](./ROADMAP.md) for the full list including medium and hard issues.

---

## Running the project locally

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/ioanamarinelababa1/task-manager.git
cd task-manager
```

### 2. Backend (NestJS)

```bash
cd backend
cp .env.example .env        # fill in DB credentials and JWT secrets
npm install
npm run start:dev           # starts on http://localhost:3001
```

Swagger UI is available at `http://localhost:3001/api` once the backend is running.

**Required environment variables** (see `.env.example`):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `NODE_ENV` | `development` \| `production` |

### 3. Frontend (Next.js)

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev                         # starts on http://localhost:3000
```

### Alternative — Docker

Run the full stack with a single command (no separate Node or npm setup required):

```bash
cp backend/.env.example backend/.env         # fill in DB credentials and JWT secrets
cp frontend/.env.local.example frontend/.env.local
docker-compose up --build
```

Backend runs on: http://localhost:3001  
Frontend runs on: http://localhost:3000

---

## Branch naming convention

| Type | Pattern | Example |
|---|---|---|
| New feature | `feature/<short-description>` | `feature/task-filters` |
| Bug fix | `fix/<short-description>` | `fix/mobile-safari-auth-cookie` |
| Test | `test/<short-description>` | `test/add-ownership-tests` |
| Chore / tooling | `chore/<short-description>` | `chore/update-dependencies` |
| Documentation | `docs/<short-description>` | `docs/swagger-setup` |
| Refactor | `refactor/<short-description>` | `refactor/auth-service` |
| Security | `security/<short-description>` | `security/helmet-csp` |

Use lowercase and hyphens only — no spaces or underscores.

---

## Commit message convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<optional scope>): <short summary>
```

| Type | When to use |
|---|---|
| `feat` | A new feature visible to the user |
| `fix` | A bug fix |
| `chore` | Build tooling, dependency updates, config changes |
| `docs` | Documentation changes only |
| `refactor` | Code restructuring with no behaviour change |
| `security` | Security hardening, vulnerability patches |
| `test` | Adding or updating tests |

**Examples:**

```
feat(tasks): add task filtering by status
fix(tasks): return 404 when task does not exist
security(auth): rotate JWT secret and enforce httpOnly cookies
docs(swagger): annotate tasks controller with ApiResponse decorators
chore(deps): upgrade @nestjs/throttler to v6
```

Rules:
- Use the imperative mood: "add" not "added" or "adds"
- Keep the subject line under 72 characters
- Reference related issues in the body: `Closes #42`

---

## How to submit a pull request

### Step 1 — Fork and clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/task-manager.git
cd task-manager
git remote add upstream https://github.com/ioanamarinelababa1/task-manager.git
```

### Step 2 — Create a branch

```bash
git checkout -b feature/dark-mode   # follow the branch naming convention below
```

### Step 3 — Make your changes

- Write focused, atomic commits — one logical change per commit.
- Follow the [commit message convention](#commit-message-convention).
- Run `npm run lint` and `npm test` before pushing.

### Step 4 — Keep your branch up to date

```bash
git fetch upstream
git rebase upstream/main
```

### Step 5 — Open a pull request

Push to your fork and open a PR against `main` on the upstream repo.
Fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md) — include what changed, why, and how to test it.

### Step 6 — Review cycle

- Address feedback with new commits — do not force-push after a review has started.
- A PR requires at least one approval before it can be merged.

---

## PR checklist

Before marking your PR ready for review, confirm all of the following:

- [ ] `npm run lint:ci` passes with 0 errors
- [ ] `npm test` passes with 0 failures
- [ ] The PR description explains **why** the change is needed, not just what it does
- [ ] New behaviour is covered by tests (unit or integration)
- [ ] No secrets, tokens, or credentials appear anywhere in the diff
- [ ] `CHANGELOG.md` or relevant docs updated if the change is user-facing

---

## Code style

- **TypeScript strict mode** is enabled — all types must be explicit.
- **No `any` types** — use `unknown` and narrow, or define a proper interface.
- **DTOs for all inputs** — every controller method that accepts a body must use a class decorated with `class-validator` decorators.
- **Whitelist validation** — `ValidationPipe` is configured with `whitelist: true` and `forbidNonWhitelisted: true`; unknown fields are rejected.
- **Sanitize user input** — pass string fields through `sanitizeString()` from `common/utils/sanitize.ts` via `@Transform`.
- **No raw SQL** — use TypeORM query builders or parameterised queries only.
- Formatting is enforced by Prettier; run `npm run format` before committing.
- Linting is enforced by ESLint; run `npm run lint` before committing.

---

## Running tests

```bash
# Backend — run all 38 unit tests
cd backend && npm run test

# Backend — coverage report
cd backend && npm run test:cov

# Backend — end-to-end tests
cd backend && npm run test:e2e
```

Current coverage: `auth.service` 94.6%, `tasks.service` 81.6%.

Coverage targets for new contributions: `auth.service` > 90%, `tasks.service` > 80%.

---

## Reporting a security vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.  
Follow the responsible disclosure process described in [SECURITY.md](./SECURITY.md).
