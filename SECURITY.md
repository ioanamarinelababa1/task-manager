# Security

This document describes every security measure implemented in this project, the reasoning behind each decision, known limitations of the current implementation, and what would be added before a production deployment.

---

## Implemented Measures

### 1. Dependency Audit
`npm audit` returns **0 vulnerabilities** in both `/backend` and `/frontend` as of the last update. Both `package-lock.json` files are committed so CI can reproduce exact dependency trees.

### 2. Secret Management
- All secrets live in `.env` files that are listed in every `.gitignore` (backend, frontend, root).
- `.env.example` files document every variable with placeholder values and generation instructions — no real credentials appear anywhere in the repository.
- `JWT_SECRET` and `JWT_REFRESH_SECRET` are both ≥ 32 characters and are different from each other. Recommended generation: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

### 3. HTTP Security Headers (Helmet)
`app.use(helmet())` is applied before any route handler in `main.ts`. This sets:
- `X-Content-Type-Options: nosniff` — prevents MIME-type sniffing attacks
- `X-Frame-Options: SAMEORIGIN` — prevents clickjacking via iframes
- `Strict-Transport-Security` — enforces HTTPS on subsequent visits
- `X-XSS-Protection: 0` — disables the legacy broken XSS filter (modern CSP is the correct defence)
- `Referrer-Policy: no-referrer` — prevents leaking URLs in the Referer header

### 4. CORS Hardening
CORS is restricted to a single trusted origin with explicit method and header allowlists:
```
origin: 'http://localhost:3000'
methods: ['GET', 'POST', 'PUT', 'DELETE']
allowedHeaders: ['Content-Type', 'Authorization']
credentials: true   ← required for httpOnly cookie auth
```
Any other origin, method, or header is rejected by the browser before the request reaches NestJS.

### 5. JWT Authentication
- **Access token**: 15-minute expiry, signed with `JWT_SECRET`, delivered as an `httpOnly` cookie.
- **Refresh token**: 7-day expiry, signed with a *separate* `JWT_REFRESH_SECRET`, delivered as an `httpOnly` cookie scoped to `Path: /auth/refresh` so it is only sent to the token refresh endpoint.
- **httpOnly cookies** cannot be read or stolen by JavaScript, eliminating the XSS attack vector that exists when tokens are stored in `localStorage`.
- `SameSite: Strict` on both cookies blocks cross-site request forgery (CSRF) without requiring a separate CSRF token for same-origin flows.
- `Secure: true` in production ensures cookies are only transmitted over HTTPS.
- `GET /auth/me` is the authoritative auth check — `AuthGuard` calls it on every page load instead of relying on locally stored state.

### 6. Password Security
Passwords must satisfy all of the following (validated on both frontend and backend):
- Minimum 8 characters
- At least one uppercase letter (`[A-Z]`)
- At least one lowercase letter (`[a-z]`)
- At least one number (`[0-9]`)

Passwords are hashed with `bcrypt` at cost factor 10 before storage. Comparison uses `bcrypt.compare()` — never plain string equality. The login path performs the `bcrypt.compare()` call even when no user is found (constant-time behaviour) to prevent timing attacks that distinguish "user not found" from "wrong password".

### 7. Input Validation
`ValidationPipe` is registered globally with:
- `whitelist: true` — unknown properties are stripped before reaching controller code
- `forbidNonWhitelisted: true` — a request with unknown fields is rejected with 400
- `transform: true` — route params and body are auto-cast to declared DTO types

`@Transform` decorators on all string DTO fields trim whitespace and strip HTML tags before validation runs, providing a defence-in-depth layer against stored XSS.

### 8. SQL Injection Prevention
All database access uses TypeORM repository methods (`find`, `findOne`, `save`, `update`, `delete`). TypeORM generates parameterized queries for all of these — user input is never concatenated into SQL strings. No raw query strings exist in the codebase.

### 9. Rate Limiting
`@nestjs/throttler` (v6) applies rate limits per IP:

| Route group | Limit | Window |
|---|---|---|
| All routes (global baseline) | 100 req | 60 s |
| `/auth/*` routes | 10 req | 60 s |
| `/auth/login` specifically | 5 req | 60 s |
| `/tasks/*` routes | 60 req | 60 s |

The tighter login limit significantly slows credential-stuffing and brute-force attacks.

### 10. ID Validation
`ParsePositiveIntPipe` guards every `:id` route parameter. It rejects NaN, zero, negative values, floats, and strings with leading zeros (`"007"`) before the service layer is reached.

### 11. Error Handling
`GlobalExceptionFilter` is registered globally and ensures:
- 500 errors return `"An unexpected error occurred"` — no stack trace, no internal message
- `HttpException` subclasses (400, 401, 404, etc.) return their developer-facing messages as normal
- All unhandled exceptions are logged server-side with timestamp, method, and path
- All responses share the shape `{ statusCode, message, timestamp }`

---

## Known Limitations

| Limitation | Risk | Notes |
|---|---|---|
| No token blacklist | A stolen access token remains valid for up to 15 minutes | Requires Redis; see Production section |
| Refresh tokens are not rotated | If a refresh token is stolen, it is valid for 7 days | Rotation + revocation list (Redis) solves this |
| `synchronize: true` in TypeORM | Schema changes apply automatically — safe in dev, dangerous in prod | Disable in production; use migrations |
| HTTP in development | Cookies do not have `Secure: true` locally | `Secure` is gated on `NODE_ENV === 'production'` |
| Single allowed CORS origin | Hardcoded to `localhost:3000` | Must be configurable via environment variable for staging/production |
| No audit logging | No record of who did what and when | Important for compliance |
| No account lockout after N failed logins | Rate limiting slows attacks but does not lock accounts | Requires a failed-attempt counter in the database |

---

## Production Checklist

The following would be added before deploying to a production environment:

**Infrastructure**
- [ ] HTTPS everywhere — `Secure` cookie attribute becomes active, HTTP→HTTPS redirect
- [ ] Environment variables managed by the hosting platform (Vercel env vars, Railway secrets) — never in the repository
- [ ] `synchronize: false` in TypeORM — use explicit migration files instead
- [ ] Database connection pool limits configured to prevent exhaustion attacks

**Token Management**
- [ ] Redis for refresh token storage and revocation — enables true logout and rotation
- [ ] Refresh token rotation — every refresh call invalidates the old refresh token and issues a new one
- [ ] Token blacklist for access tokens on explicit logout — eliminates the 15-minute abuse window

**Additional Hardening**
- [ ] Content Security Policy (CSP) header via Helmet configuration — restricts which scripts/styles/fonts can load
- [ ] `allowedOrigins` configurable via environment variable — no hardcoded hostnames
- [ ] Account lockout after N consecutive failed login attempts
- [ ] Email verification on registration
- [ ] Audit log table — records every create/update/delete with user id and timestamp
- [ ] Dependency update automation (Dependabot or Renovate)
- [ ] SAST scan in CI pipeline (e.g. Snyk, Semgrep)
