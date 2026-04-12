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
| Frontend | Next.js 14, Tailwind CSS |
| Auth | JWT (in progress) |
| Deploy | Vercel |
| Version Control | Git + GitHub |

## Features
- Full CRUD for tasks (Create, Read, Update, Delete)
- Task status tracking: `TODO` / `IN_PROGRESS` / `DONE`
- RESTful API with NestJS controllers and services
- PostgreSQL database with TypeORM entity management
- User authentication (in progress)
- Responsive UI with Tailwind CSS

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
# Backend
cd backend
npm install
npm run start:dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev

Backend runs on: http://localhost:3001
Frontend runs on: http://localhost:3000

## Project Structure
task-manager/
├── backend/         # NestJS API
│   └── src/
│       ├── tasks/   # Tasks module (entity, controller, service)
│       └── app.module.ts
└── frontend/        # Next.js UI
    └── src/
        └── app/

## Author
Ioana-Marinela Baba 
GitHub: github.com/ioanamarinelababa1
