# Task Manager

A full-stack Task Manager application built with NestJS, PostgreSQL, and Next.js. 
Designed to help users organize, track, and manage their daily tasks efficiently 
through a clean REST API and a modern, responsive interface.

## Why Task Manager?
Most people struggle with keeping track of what needs to be done, what's in progress, 
and what's completed. Task Manager solves this by providing a simple but powerful 
system to organize work with real-time status tracking — moving tasks from TODO → 
IN_PROGRESS → DONE with full control over every entry.

## What makes it different?
- Built with production-grade architecture (NestJS modules, services, controllers)
- PostgreSQL database hosted on Supabase — cloud-native from day one
- Type-safe throughout — TypeScript on both frontend and backend
- Clean Git workflow with conventional commits — readable project history
- Deploy-ready on Vercel with zero configuration

## Tech Stack
| Layer | Technology |
|-------|------------|
| Backend | NestJS, TypeScript, TypeORM |
| Database | PostgreSQL (Supabase) |
| Frontend | Next.js 16, Tailwind CSS v4 |
| Auth | JWT (in progress) |
| Deploy | Vercel |
| Version Control | Git + GitHub |

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
- ✅ PostgreSQL database with TypeORM entity management
- 🔄 User authentication (in progress)
- 🔄 Deploy on Vercel (in progress)

## Screenshots

### Task Board
The main view renders all tasks as cards in a responsive grid (1 column on mobile, 2 on tablet, 3 on desktop). Each card displays the task title, an optional description, a colored status badge, and the creation date. Edit and delete action buttons appear on hover.

```
┌─────────────────────────────────────────────────────────────┐
│  📓 Task Manager                          [ + New Task ]     │
├─────────────────────────────────────────────────────────────┤
│  12 Total  ● To Do 4  ● In Progress 5  ● Done 3   Refresh  │
├───────────────┬───────────────┬─────────────────────────────┤
│ ● To Do       │ ● In Progress │ ● Done                      │
│ Design login  │ Build API     │ Set up DB                   │
│ page mockups  │ endpoints     │                             │
│               │               │ Created Apr 10, 2026        │
│ Created ...   │ Created ...   │                  ✏️  🗑️     │
├───────────────┼───────────────┼─────────────────────────────┤
│  ...          │  ...          │  ...                        │
└───────────────┴───────────────┴─────────────────────────────┘
```

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

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | Get all tasks |
| GET | /tasks/:id | Get task by ID |
| POST | /tasks | Create new task |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |

## Getting Started

### Prerequisites
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

## Project Structure
```
task-manager/
├── backend/              # NestJS API
│   └── src/
│       ├── tasks/        # Tasks module (entity, controller, service)
│       └── app.module.ts
└── frontend/             # Next.js UI
    └── app/
        ├── components/   # TaskCard, TaskModal, DeleteModal, StatusBadge
        ├── lib/          # API client, TypeScript types
        ├── icon.svg      # Purple notebook favicon
        └── page.tsx
```

## Author
Ioana-Marinela Baba  
GitHub: github.com/ioanamarinelababa1
