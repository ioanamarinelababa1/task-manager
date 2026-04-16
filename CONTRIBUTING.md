# Contributing to Task Manager

Thank you for taking the time to contribute. This guide covers everything you need to get started.

---

## Table of Contents

- [Running the project locally](#running-the-project-locally)
- [Branch naming convention](#branch-naming-convention)
- [Commit message convention](#commit-message-convention)
- [Pull request process](#pull-request-process)
- [Code style](#code-style)
- [Running tests](#running-tests)
- [Reporting a security vulnerability](#reporting-a-security-vulnerability)

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

---

## Branch naming convention

| Type | Pattern | Example |
|---|---|---|
| New feature | `feature/<short-description>` | `feature/google-oauth` |
| Bug fix | `fix/<short-description>` | `fix/refresh-token-expiry` |
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
feat(auth): add Google OAuth 2.0 login
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

## Pull request process

1. Create a branch from `main` following the naming convention above.
2. Make focused, atomic commits — one logical change per commit.
3. Open a pull request against `main` with:
   - **Title** following Conventional Commits format
   - **Description** covering:
     - What changed and why
     - How to test the change manually
     - Links to related issues (`Closes #42`)
4. Ensure the build passes before requesting a review.
5. Address review feedback with new commits — do not force-push after a review has started.
6. A pull request requires at least one approval before it can be merged.

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

> **TODO:** Unit and integration test coverage is not yet complete. Tests will be added as the project matures.

Once tests are available, run them with:

```bash
# Backend — unit tests
cd backend && npm run test

# Backend — test coverage report
cd backend && npm run test:cov

# Backend — end-to-end tests
cd backend && npm run test:e2e
```

---

## Reporting a security vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.  
Follow the responsible disclosure process described in [SECURITY.md](./SECURITY.md).
