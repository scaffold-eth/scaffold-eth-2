# Drizzle ORM + Neon PostgreSQL Integration

## What was built

Full PostgreSQL database integration for SE-2 using Drizzle ORM with Neon PostgreSQL support, following the `drizzle-neon` skill patterns exactly.

## Files created

### Database infrastructure
- **`packages/nextjs/services/database/config/postgresClient.ts`** — Smart database client with lazy proxy that auto-detects environment (local Postgres via Docker, Neon serverless, or Neon HTTP) and selects the optimal driver. Uses singleton pattern with `getDb()` and exposes `db` as a proxy for lazy connections.
- **`packages/nextjs/services/database/config/schema.ts`** — Drizzle schema defining a `users` table with `id` (uuid, auto-generated), `name` (varchar), `address` (varchar, optional for Ethereum addresses), and `createdAt` (timestamp).
- **`packages/nextjs/drizzle.config.ts`** — Drizzle Kit configuration for migrations, studio, and schema push. Uses `snake_case` casing to match the client config.

### Repository layer
- **`packages/nextjs/services/database/repositories/users.ts`** — Repository pattern with typed CRUD functions (`getAllUsers`, `getUserById`, `createUser`) using Drizzle's relational query API and `InferSelectModel`/`InferInsertModel` types.

### API layer
- **`packages/nextjs/app/api/users/route.ts`** — Next.js API routes (GET all users, POST create user) with input validation.
- **`packages/nextjs/services/api/users.ts`** — Client-side API service functions for use with `@tanstack/react-query`.

### UI
- **`packages/nextjs/app/users/page.tsx`** — Server Component page at `/users` that displays all users and provides a Server Action form to add new users with name and optional Ethereum address. Uses DaisyUI styling.

### Scripts & tooling
- **`packages/nextjs/services/database/seed.ts`** — Seed script with 3 test users (Alice, Bob, Charlie) and production safety guard.
- **`packages/nextjs/services/database/wipe.ts`** — Wipe script using `drizzle-seed` reset with production safety guard.
- **`docker-compose.yml`** — Local PostgreSQL 16 via Docker with persistent volume.

### Environment & config
- **`packages/nextjs/.env.development`** — Local Postgres connection string.
- **`packages/nextjs/.env.example`** — Added `POSTGRES_URL=` placeholder.

## Files modified

- **`packages/nextjs/package.json`** — Added `drizzle-orm`, `@neondatabase/serverless`, `pg`, `dotenv` to dependencies; `drizzle-kit`, `drizzle-seed`, `tsx`, `@types/pg` to devDependencies; `db:seed`, `db:wipe`, `drizzle-kit` scripts.
- **`package.json`** (root) — Added `drizzle-kit`, `db:seed`, `db:wipe` proxy scripts.
- **`.gitignore`** — Added `data` directory (Docker Postgres volume).

## Architecture decisions

- **Smart driver selection**: The `postgresClient.ts` detects Neon URLs (`neondb` in connection string) and runtime context (`NEXT_RUNTIME`) to pick the right driver — WebSocket for serverless, HTTP for scripts, standard `pg` for local.
- **Lazy proxy pattern**: Database connection is deferred until first query, preventing connection issues at import time.
- **`casing: "snake_case"`** set in both `drizzle.config.ts` and client initialization to ensure column name consistency.
- **Production safety guards** in seed/wipe scripts prevent accidental data loss.
- **Repository pattern** separates data access from route handlers for testability and reuse.
