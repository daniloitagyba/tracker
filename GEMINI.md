# Project Context: Tracker

## Overview
**Tracker** is a fullstack application designed for tracking postal packages. It features a modern React frontend and a robust Fastify backend, utilizing Google OAuth for secure user authentication. The project is structured as a monorepo managed by `pnpm`.

## Architecture & Technologies

### Backend (`/backend`)
*   **Framework:** Node.js with [Fastify](https://www.fastify.io/)
*   **Database:** PostgreSQL managed via [Prisma ORM](https://www.prisma.io/)
*   **Authentication:** Google OAuth 2.0, JWT (Access & Refresh Tokens)
*   **Validation:** [Zod](https://zod.dev/)
*   **External API:** RapidAPI (Correios Tracking)

### Frontend (`/frontend`)
*   **Framework:** [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
*   **Core Framework:** [Refine](https://refine.dev/) (headless framework for CRUD apps)
*   **UI Library:** [Material UI](https://mui.com/)
*   **Routing:** React Router v6
*   **State Management:** React Query (via Refine)

### Infrastructure
*   **Containerization:** Docker & Docker Compose
*   **Database:** PostgreSQL (production/docker), SQLite (dev default in `README` but `docker-compose` uses Postgres)

## Key Files & Directories

### Root
*   `pnpm-workspace.yaml`: Defines the workspace structure (`backend`, `frontend`).
*   `docker-compose.yml`: Orchestrates Postgres, Backend, and Frontend containers.
*   `package.json`: Root scripts for managing the monorepo.

### Backend (`/backend`)
*   `src/app.ts`: Main application factory, plugin registration (CORS, Auth, Routes).
*   `src/server.ts`: Entry point, server startup.
*   `prisma/schema.prisma`: Database schema definition (`User`, `Package`).
*   `src/modules/`: Domain logic organized by feature (`auth`, `user`, `package`).
*   `src/plugins/auth.plugin.ts`: Fastify plugin for JWT handling.

### Frontend (`/frontend`)
*   `src/App.tsx`: Main component, Refine configuration, Route definitions.
*   `src/providers/`: Custom providers for Refine (`authProvider`, `dataProvider`).
*   `src/pages/`: Application pages (`login`, `packages`).
*   `vite.config.ts`: Vite configuration.

## Data Model

### User
*   `id`: UUID
*   `googleId`: Unique Google identifier
*   `email`: User email
*   `packages`: Relation to `Package` model

### Package
*   `id`: UUID
*   `description`: User-defined description
*   `trackingCode`: Postal tracking code
*   `userId`: Foreign key to `User`
*   `lastStatus`, `lastLocation`: Cached tracking info

## Development Workflow

### Prerequisites
*   Node.js 18+
*   pnpm (`npm install -g pnpm`)
*   Docker & Docker Compose (optional, for local DB/deployment)

### Setup
1.  **Install Dependencies:**
    ```bash
    pnpm install
    ```
2.  **Environment Variables:**
    *   Copy `.env.example` to `.env` in both `backend` and `frontend`.
    *   Configure `DATABASE_URL` and Google OAuth credentials in `backend/.env`.

### Database
*   **Generate Client:** `pnpm --filter tracker-backend db:generate`
*   **Push Schema:** `pnpm --filter tracker-backend db:push` (for dev)
*   **Migrations:** `pnpm --filter tracker-backend db:migrate`

### Running the App
*   **Development (Concurrent):**
    ```bash
    pnpm dev
    ```
    *   Frontend: `http://localhost:3000`
    *   Backend: `http://localhost:3001`

*   **Scoped Commands:**
    *   Backend only: `pnpm --filter tracker-backend dev`
    *   Frontend only: `pnpm --filter tracker-frontend dev`

### Building
*   **Full Build:** `pnpm build`
*   **Backend Build:** `pnpm --filter tracker-backend build`
*   **Frontend Build:** `pnpm --filter tracker-frontend build`

## Conventions
*   **Monorepo:** Use `pnpm --filter <package> <command>` to run commands in specific workspaces.
*   **Styling:** Use Material UI components and Refine's hooks for data fetching.
*   **Type Safety:** Strict TypeScript usage across the stack. Zod schemas in backend mirror TS types.

## Good Programming Practices

### Code Style and Structure
- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Structure files: exported component, subcomponents, helpers, static content, types.

### Naming Conventions
- `lowerCamelCase`: variables, constants, functions
- `UpperCamelCase`: classes, components, interfaces
- `UPPER_SNAKE_CASE`: global/static variables
- Name all functions (avoid anonymous functions)
- Use descriptive but concise names

### Variable Declaration
- Prefer `const` over `let`
- Avoid `var` completely (ES6+)
- `const` prevents accidental reassignment
- `let` for block-scoped variables that need reassignment

### Module Management
- Require modules at file beginning
- Import before any function definitions
- Avoid requires inside functions (except lazy loading)

### Module Entry Points
- Set explicit entry point (`index.ts` or `package.json` main)
- Use `package.json` exports for ESM
- Hide internal structure from clients

### Async Patterns
- Use `async`/`await` as primary pattern
- Avoid callbacks (callback hell)
- Promises for library compatibility
- Arrow functions for compact code

### Input Validation
- Validate all user input
- Use validation library **Zod** (already in use)
- Implement allow-lists over deny-lists
- Validate data types and formats

### Side Effects
- Avoid effects outside of functions
- No DB/network calls at module load time
- Use factory or revealing module patterns for initialization
- Keep code testable and mockable

### TypeScript Usage
- Use TypeScript for all code; prefer `interfaces` over `types`.
- Avoid `enums`; use maps or union types instead.
- Use functional components with TypeScript interfaces.

### Syntax and Formatting
- Use the `function` keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

### UI and Styling (Adapted for Project)
- **Use Material UI (MUI)** for components and styling (Project Standard).
- Implement responsive design with MUI system; use a mobile-first approach.
- *Note: The provided prompt mentioned Shadcn/Tailwind, but this project is configured for Material UI. Adhere to MUI conventions.*