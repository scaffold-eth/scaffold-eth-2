# Drizzle ORM + Neon PostgreSQL Integration for SE-2

## What was built

Full PostgreSQL database integration using Drizzle ORM with Neon serverless support, following the drizzle-neon skill patterns exactly. The implementation includes:

- **Smart database client** that auto-detects the environment (local Postgres via Docker, Neon serverless, or Neon HTTP) and selects the optimal driver
- **Schema definition** with a `users` table (id, name, address, createdAt)
- **Repository pattern** with typed CRUD functions for the users entity
- **API routes** (GET/POST) for client-side access
- **Client-side API service** using fetch for use with `@tanstack/react-query`
- **Server Component page** at `/users` with a form using Server Actions for adding users
- **Docker Compose** configuration for local PostgreSQL development
- **Seed and wipe scripts** with production safety guards
- **Drizzle Kit configuration** for migrations and studio

## Files created

| File | Purpose |
|------|---------|
| `packages/nextjs/services/database/config/schema.ts` | Drizzle schema defining the `users` table |
| `packages/nextjs/services/database/config/postgresClient.ts` | Smart database client with auto-driver selection (pg, neon-serverless, neon-http) and lazy proxy |
| `packages/nextjs/drizzle.config.ts` | Drizzle Kit configuration for migrations, studio, and schema push |
| `packages/nextjs/services/database/repositories/users.ts` | Repository with typed CRUD functions (getAllUsers, getUserById, getUserByAddress, createUser, deleteUser) |
| `packages/nextjs/services/database/seed.ts` | Seed script with sample users and production safety guard |
| `packages/nextjs/services/database/wipe.ts` | Wipe script using drizzle-seed reset with production safety guard |
| `packages/nextjs/app/api/users/route.ts` | Next.js API routes (GET all users, POST create user) with error handling |
| `packages/nextjs/services/api/users.ts` | Client-side API service functions for fetching and creating users |
| `packages/nextjs/app/users/page.tsx` | Server Component page displaying users list and add-user form with Server Actions |
| `docker-compose.yml` | Docker Compose config for local PostgreSQL 16 |
| `packages/nextjs/.env.development` | Local development database connection string |

## Files modified

| File | Change |
|------|--------|
| `packages/nextjs/package.json` | Added dependencies (drizzle-orm, @neondatabase/serverless, pg, dotenv) and devDependencies (drizzle-kit, drizzle-seed, tsx, @types/pg), plus db:seed, db:wipe, drizzle-kit scripts |
| `package.json` (root) | Added drizzle-kit, db:seed, db:wipe proxy scripts |
| `packages/nextjs/.env.example` | Added POSTGRES_URL= placeholder |
| `.gitignore` | Added `data` directory (Docker Postgres volume) |

## Architecture

The database client uses a three-tier driver selection strategy:

1. **Local development**: Standard `pg` Pool driver when the connection URL does not contain `neondb`
2. **Neon in Next.js runtime**: `@neondatabase/serverless` WebSocket-based driver (works in serverless/edge)
3. **Neon in scripts**: `@neondatabase/serverless` HTTP driver (supports batch operations for seed/wipe)

The `casing: "snake_case"` setting is consistently applied in both `drizzle.config.ts` and the client initialization, ensuring camelCase TypeScript properties map correctly to snake_case PostgreSQL columns.
