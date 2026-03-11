# Drizzle ORM + Neon PostgreSQL Integration Summary

## What Was Built

A full-stack database integration for storing off-chain user profile data using Drizzle ORM with Neon PostgreSQL, including schema definition, migration tooling, RESTful API routes, React Query hooks, and a UI page.

## Architecture

- **Database layer**: Drizzle ORM with `@neondatabase/serverless` HTTP driver for serverless-compatible Neon PostgreSQL
- **API layer**: Next.js App Router API routes with full CRUD operations
- **Client layer**: React Query hooks wrapping fetch-based API service functions
- **UI layer**: Database page with profile management form and users table

## Files Created

### Database Layer
1. **`packages/nextjs/server/db/schema.ts`** — Drizzle schema defining the `users` table with columns: id, address (unique ETH address), name, email, bio, isActive, createdAt, updatedAt. Exports inferred `User` and `NewUser` types.
2. **`packages/nextjs/server/db/index.ts`** — Database client singleton using Neon HTTP driver with schema, reads `DATABASE_URL` from environment.
3. **`packages/nextjs/server/db/migrate.ts`** — Standalone migration runner script (executed via `tsx`).
4. **`packages/nextjs/drizzle.config.ts`** — Drizzle Kit configuration for schema introspection, migration generation, and push.

### API Routes
5. **`packages/nextjs/app/api/users/route.ts`** — `GET /api/users` (list all) and `POST /api/users` (create or update by address). Validates Ethereum address format, normalizes to lowercase.
6. **`packages/nextjs/app/api/users/[address]/route.ts`** — `GET` (fetch by address), `PUT` (update fields), `DELETE` (remove user). Uses Next.js 15 async params pattern.

### Client Service Layer
7. **`packages/nextjs/services/database/api.ts`** — Typed fetch functions: `fetchUsers`, `fetchUserByAddress`, `createOrUpdateUser`, `updateUser`, `deleteUser`.
8. **`packages/nextjs/services/database/hooks.ts`** — React Query hooks: `useUsers`, `useUserByAddress`, `useCreateOrUpdateUser`, `useUpdateUser`, `useDeleteUser`. Mutations auto-invalidate the users query cache.
9. **`packages/nextjs/services/database/index.ts`** — Barrel export for the database service.

### UI
10. **`packages/nextjs/app/database/page.tsx`** — Full-page UI with: wallet-connected profile form (create/update/delete), current profile display card, and a table listing all registered users with their Address component, name, email, and join date.

## Files Modified

11. **`packages/nextjs/components/Header.tsx`** — Added "Database" navigation link with `CircleStackIcon`.
12. **`packages/nextjs/.env.example`** — Added `DATABASE_URL` environment variable placeholder with Neon console link.
13. **`packages/nextjs/package.json`** — Added dependencies (`drizzle-orm`, `@neondatabase/serverless`), devDependencies (`drizzle-kit`, `tsx`), and scripts (`db:generate`, `db:migrate`, `db:push`, `db:studio`).
14. **`package.json`** (root) — Added root-level convenience scripts: `db:generate`, `db:migrate`, `db:push`, `db:studio`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn db:generate` | Generate SQL migration files from schema changes |
| `yarn db:migrate` | Run pending migrations against the database |
| `yarn db:push` | Push schema directly to database (dev shortcut, no migration files) |
| `yarn db:studio` | Open Drizzle Studio for visual database browsing |

## Setup Instructions

1. Create a Neon PostgreSQL database at https://console.neon.tech
2. Copy `packages/nextjs/.env.example` to `packages/nextjs/.env.local`
3. Set `DATABASE_URL` to the Neon connection string (pooled endpoint recommended)
4. Run `yarn db:push` to create the tables, or `yarn db:generate && yarn db:migrate` for migration-based workflow
5. Start the app with `yarn start` and navigate to the "Database" tab

## Verification

- TypeScript type check: passes (`yarn next:check-types`)
- ESLint: passes (`yarn next:lint`)
- All files formatted with Prettier
