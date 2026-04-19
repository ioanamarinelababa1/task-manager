# Roadmap

Planned features and improvements, organised by effort level. Items marked **good first issue** are great starting points for new contributors — see [CONTRIBUTING.md](./CONTRIBUTING.md#good-first-issues) for guidance on getting started.

---

## Easy — good first issue

These are self-contained UI improvements that don't require backend changes.

| Feature | Description |
|---|---|
| **Dark mode toggle** | Add a `ThemeProvider` and a header toggle that switches between light and dark Tailwind classes. Persist the preference in `localStorage`. |
| **Filter tasks by status** | Add filter buttons (All / TODO / IN_PROGRESS / DONE) above the task grid. Filter client-side — no API change needed. |
| **Search tasks by title** | Add a search input that filters the visible task list by title as the user types. |
| **Sort tasks by date** | Add a newest/oldest toggle that re-orders the task grid without re-fetching from the API. |
| **Character counter on task title** | Show `n / 100` remaining characters inside the create/edit modal's title field. |

---

## Medium

These require either a new backend endpoint, a database change, or non-trivial frontend state management.

| Feature | Description |
|---|---|
| **Due date for tasks** | Add an optional `dueDate` field to the task entity. Display it on the card and highlight overdue tasks in red. |
| **Priority levels** | Add a `priority` enum (Low / Medium / High) to tasks. Display a priority badge on each card and allow filtering by priority. |
| **Task categories / labels** | Allow users to create custom labels and attach them to tasks. Filter the board by label. |
| **Pagination** | Replace the flat task list with paginated results (e.g. 20 per page) to keep the UI fast with large datasets. Requires a `GET /tasks?page=&limit=` query param on the backend. |

---

## Hard

These are significant features that require careful design — great for contributors who want a substantial challenge.

| Feature | Description |
|---|---|
| **Drag and drop (Kanban)** | Allow users to drag task cards between status columns. Use a library such as `@dnd-kit/core`. Persist the new status via `PUT /tasks/:id`. |
| **Email notifications for due dates** | Send a reminder email 24 hours before a task is due. Requires a scheduled job (`@nestjs/schedule`), an email provider (e.g. Resend or SendGrid), and a user preference to opt in/out. |
| **Shared workspaces for teams** | Allow users to create a workspace and invite others by email. Tasks belong to a workspace rather than a single user. Requires a new `workspace` entity, membership table, and role-based access control. |
| **Export tasks to CSV / PDF** | Add an export button that downloads the current task list. CSV can be generated client-side; PDF requires a library such as `pdfmake` or a backend endpoint with `puppeteer`. |

---

## Contributing

Pick any item above, open an issue to discuss your approach, then follow the [contribution guide](./CONTRIBUTING.md). PRs are welcome at any difficulty level.
