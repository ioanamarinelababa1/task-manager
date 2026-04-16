# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### In Progress
- Google OAuth 2.0 login (`passport-google-oauth20`)
- Vercel deployment for the Next.js frontend

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
- Input validation using `class-validator` and `class-transformer` with a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`)
- DTOs for all controller inputs: `CreateTaskDto`, `UpdateTaskDto`, `RegisterDto`, `LoginDto`
- XSS sanitization on all string inputs via a shared `sanitizeString()` utility
- Rate limiting with `@nestjs/throttler` — 60 req/min on task routes, 10 req/min on auth routes, 5 req/min on login
- Security headers via `helmet` (X-Content-Type-Options, X-Frame-Options, HSTS, CSP, etc.)
- httpOnly cookie storage for access and refresh tokens (not accessible from JavaScript)
- `SameSite: strict` cookie policy to block CSRF
- Refresh token cookie scoped to `path: /auth/refresh` so it is not sent on every request
- Global exception filter (`GlobalExceptionFilter`) — consistent error shape, no stack trace leakage
- CORS hardening — only `http://localhost:3000` allowed, explicit methods and headers, `credentials: true`
- Custom `ParsePositiveIntPipe` for route parameters
- Swagger UI at `http://localhost:3001/api` and JSON spec at `http://localhost:3001/api-json`

#### Frontend (Next.js)
- Next.js 15 application with App Router and Tailwind CSS
- Task list view with status badges (`TODO`, `IN_PROGRESS`, `DONE`)
- Stats bar showing task counts per status
- Create, edit, and delete task UI
- Toast notifications for user feedback
- Authentication pages: register and login

### Security
- Full security audit completed — see `SECURITY.md` for the vulnerability disclosure policy
- SQL injection protection via TypeORM parameterised queries
- No sensitive data (tokens, passwords) returned in response bodies

[Unreleased]: https://github.com/ioanamarinelababa1/task-manager/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ioanamarinelababa1/task-manager/releases/tag/v0.1.0
