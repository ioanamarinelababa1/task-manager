# Roadmap

## Vision

Task Manager is an open source, production-grade task management application built with NestJS, PostgreSQL, and Next.js. Contributions of all sizes are welcome — from fixing a typo to implementing a major feature.

See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

---

## Current Version (v0.1.0) — Completed

- Full CRUD for tasks with NestJS + TypeORM + PostgreSQL
- JWT authentication with httpOnly cookies and refresh token rotation
- Priority (LOW / MEDIUM / HIGH), due date, and category fields
- User data isolation — each user sees only their own tasks
- CI/CD with GitHub Actions (lint, test, build on every push)
- Security hardened: Helmet CSP, rate limiting, input validation, bcrypt
- Deployed: frontend on Vercel, backend on Railway

---

## Roadmap

### v0.2.0 — UI/UX (Good First Issues)

- [ ] Dark mode toggle — `ThemeProvider` + header toggle, persist in `localStorage`
- [ ] Filter tasks by status, priority, or category — client-side, no API change needed
- [ ] Search tasks by title — live filter as the user types
- [ ] Sort tasks by created date, due date, or priority
- [ ] Responsive mobile improvements — better layout on small screens

### v0.3.0 — Features

- [ ] Task comments — add a comment thread to each task
- [ ] File attachments — upload images or documents to a task
- [ ] Due date email notifications — send a reminder 24h before a task is due
- [ ] Recurring tasks — set a task to repeat daily, weekly, or monthly
- [ ] Task templates — save a task as a reusable template

### v0.4.0 — Collaboration

- [ ] Shared workspaces for teams — invite users by email, tasks belong to a workspace
- [ ] Task assignment — assign tasks to specific workspace members
- [ ] Activity log per task — audit trail of every change with user and timestamp
- [ ] Real-time updates with WebSockets — see changes from teammates without a page refresh

### v0.5.0 — Integrations

- [ ] Export to CSV / PDF — download the current task list
- [ ] Calendar view — visualise tasks by due date on a monthly calendar
- [ ] Slack notifications — post task updates to a Slack channel
- [ ] GitHub Issues sync — create a task from a GitHub issue and keep status in sync

---

## Contributing

Pick any unchecked item, open an issue to discuss your approach, then follow the [contribution guide](./CONTRIBUTING.md). All difficulty levels are welcome.
