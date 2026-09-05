# Mini Kanban Board

A small Trello-style app: create boards, organize them into columns, add tasks, drag tasks around — within a column or across columns — and share a board with other registered users under an owner/editor/viewer permission model.

## Tech stack

| Layer    | Choice                                                                                       |
| -------- | -------------------------------------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query · dnd-kit |
| Backend  | Express 4 · TypeScript · Prisma 5 · Zod · JWT (`jsonwebtoken` + `bcrypt`)                    |
| Database | PostgreSQL 16                                                                                |
| DevOps   | Docker Compose (separate `backend/` and `frontend/` compose files)                           |

## Repository layout

```
backend/    Express API — see backend/prisma/schema/schema.prisma for the data model
            Dockerfile + docker-compose.yml (Postgres + backend)
frontend/   Next.js app
            Dockerfile + docker-compose.yml (frontend only)
```

There is no root-level `docker-compose.yml` — the backend and frontend each ship their own, run independently (see below).

## Architecture notes

**Access control.** Every board, column, and task route sits behind two checks: `authenticate` (valid JWT → `req.user`), then `requireBoardAccess(minRole)` (`backend/src/app/middlewares/boardAccess.ts`), which resolves the caller's role on the board named in the URL — `OWNER` (the creator), `EDITOR` or `VIEWER` (via a `BoardMember` grant), or no access at all. A board that doesn't exist and a board the caller isn't a member of both return `404`, so probing ids can't be used to tell the two apart. Column and task services additionally verify the resource's `boardId` matches the URL's `boardId` before touching it, so an id belonging to a different board is rejected even if it's syntactically valid. Mutations require `EDITOR+`; sharing/removing members and deleting the board require `OWNER`.

**Task ordering.** `Task.position` and `Column.position` are plain zero-based integers. Moving a task (`PATCH /boards/:boardId/tasks/:taskId/move`, see `backend/src/app/modules/board/task/task.services.ts`) removes it from its source column's ordered list, splices it into the target list at the requested index, and rewrites `position = 0..n-1` for every task in whichever column(s) were touched — all inside one Prisma transaction. This is a deliberate choice over fractional/"lexo" positioning: it avoids float-precision drift after many moves and keeps the invariant ("what order are these tasks in") trivial to verify, at the cost of an O(column size) write per move — irrelevant at kanban-column sizes, and it comes out no more expensive than the fractional approach's periodic re-balancing pass would be.

**Sharing.** `Board.ownerId` is the owner; `BoardMember` rows are the share list (`userId` + `role`, unique per board). Sharing looks up the invitee by email — they must already be a registered user.

## Local setup

### Option A — Docker Compose (recommended)

Backend and frontend each have their own `docker-compose.yml`, so bring them up separately (two terminals):

```bash
# 1. Backend + Postgres
cd backend
sudo docker compose up --build       # http://localhost:4000/api/v1

# 2. Frontend (in a second terminal)
cd frontend
sudo docker compose up --build       # http://localhost:3000
```

`backend/docker-compose.yml` reads its variables from `backend/.env` (already present in this repo — edit it to change credentials/secrets); `frontend/docker-compose.yml` reads `NEXT_PUBLIC_API_URL` from the shell environment or `frontend/.env` (falls back to `http://localhost:4000/api/v1` if unset). See the sample env vars below.

### Option B — Run manually

Requires Node.js 20+ and a local PostgreSQL instance.

```bash
# 1. Backend
cd backend
# backend/.env already exists in this repo — edit DATABASE_URL/JWT_SECRET/etc as needed
npm install
npm run prisma:generate
npm run prisma:migrate       # creates the kanban schema
npm run dev                  # http://localhost:4000

# 2. Frontend (in a second terminal)
cd frontend
# frontend/.env.local already exists in this repo — edit NEXT_PUBLIC_API_URL if needed
npm install
npm run dev                  # http://localhost:3000
```

## Sample environment variables

**`backend/.env`**

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=kanban

# Local (non-Docker) dev: postgresql://postgres:postgres@localhost:5432/kanban
# Docker Compose:         postgresql://postgres:postgres@postgres:5432/kanban
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kanban

PORT=4000
JWT_SECRET=change-this-to-a-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## API overview

All routes below are prefixed with `/api/v1`. Authenticated routes expect `Authorization: Bearer <token>`.

| Method | Path                                  | Access   | Purpose                                                                                                 |
| ------ | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| POST   | `/auth/register`                      | Public   | Create an account                                                                                       |
| POST   | `/auth/login`                         | Public   | Sign in                                                                                                 |
| GET    | `/auth/me`                            | Any user | Current user                                                                                            |
| POST   | `/boards`                             | Any user | Create a board (creator becomes owner)                                                                  |
| GET    | `/boards`                             | Any user | List boards you own or have access to                                                                   |
| GET    | `/boards/:boardId`                    | Viewer+  | Board detail (columns, tasks, members)                                                                  |
| PATCH  | `/boards/:boardId`                    | Owner    | Rename / edit description                                                                               |
| DELETE | `/boards/:boardId`                    | Owner    | Delete the board                                                                                        |
| POST   | `/boards/:boardId/members`            | Owner    | Share the board with a registered user                                                                  |
| GET    | `/boards/:boardId/members`            | Viewer+  | List members                                                                                            |
| PATCH  | `/boards/:boardId/members/:userId`    | Owner    | Change a member's role                                                                                  |
| DELETE | `/boards/:boardId/members/:userId`    | Owner    | Revoke access                                                                                           |
| POST   | `/boards/:boardId/columns`            | Editor+  | Create a column                                                                                         |
| PATCH  | `/boards/:boardId/columns/:columnId`  | Editor+  | Rename a column                                                                                         |
| DELETE | `/boards/:boardId/columns/:columnId`  | Editor+  | Delete a column (and its tasks)                                                                         |
| POST   | `/boards/:boardId/tasks`              | Editor+  | Create a task                                                                                           |
| PATCH  | `/boards/:boardId/tasks/:taskId`      | Editor+  | Edit a task's title/description                                                                         |
| DELETE | `/boards/:boardId/tasks/:taskId`      | Editor+  | Delete a task                                                                                           |
| PATCH  | `/boards/:boardId/tasks/:taskId/move` | Editor+  | **Task Movement API** — reorder within a column or move to `{ targetColumnId, targetIndex }` in another |

## Verifying it works

1. Register two users (e.g. via the UI, or `curl -X POST .../auth/register`).
2. As user A, create a board, add a couple of columns and tasks.
3. Share the board with user B as `EDITOR`.
4. Log in as user B, open the board, drag tasks within and across columns — order should persist across a page reload.
5. Confirm a third, unshared user gets a "not available" state when visiting the board's URL directly.
