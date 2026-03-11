# Drizzle ORM + Neon PostgreSQL Integration for SE-2

## What was built

A full PostgreSQL database integration using Drizzle ORM with Neon PostgreSQL support, following the `drizzle-neon` skill patterns exactly. The implementation includes a smart database client that auto-detects the environment (local Postgres via Docker, Neon serverless, or Neon HTTP) and uses the optimal driver, a users schema, repository layer, API routes, client-side API service, a server-component users page, seed/wipe scripts, and Docker Compose for local development.

## Files Created

1. **`packages/nextjs/services/database/config/schema.ts`** — Drizzle schema defining a `users` table with `id` (UUID), `name` (varchar), `address` (varchar, optional for Ethereum addresses), and `createdAt` (timestamp).

2. **`packages/nextjs/services/database/config/postgresClient.ts`** — Smart database client that auto-selects the correct Postgres driver based on the connection string and runtime environment. Uses `drizzle-orm/neon-serverless` for Neon in Next.js runtime, `drizzle-orm/neon-http` for Neon in scripts, and `drizzle-orm/node-postgres` for local/other Postgres. Exposes a lazy proxy so imports don't eagerly connect.

3. **`packages/nextjs/drizzle.config.ts`** — Drizzle Kit configuration for migrations and studio, pointing to the schema and migrations directories, with `casing: "snake_case"` matching the client config.

4. **`packages/nextjs/services/database/repositories/users.ts`** — Repository pattern with typed CRUD functions (`getAllUsers`, `getUserById`, `createUser`) using Drizzle's query builder and type inference (`InferSelectModel`, `InferInsertModel`).

5. **`packages/nextjs/services/database/seed.ts`** — Seed script that populates the database with test users. Includes a production safety guard that prevents seeding production databases.

6. **`packages/nextjs/services/database/wipe.ts`** — Wipe script using `drizzle-seed`'s `reset()` to clear all tables. Includes a production safety guard.

7. **`packages/nextjs/app/api/users/route.ts`** — Next.js API route with GET (list all users) and POST (create user with validation) handlers for client-side consumption.

8. **`packages/nextjs/services/api/users.ts`** — Client-side API service with `fetchUsers` and `createUserAPIRequest` functions for use with `@tanstack/react-query`.

9. **`packages/nextjs/app/users/page.tsx`** — Server component page that lists users and provides a form to add new users via Server Actions. Uses DaisyUI classes for styling.

10. **`docker-compose.yml`** (project root) — Docker Compose configuration for local PostgreSQL 16 with persistent volume storage.

11. **`packages/nextjs/.env.development`** — Local development environment variables with PostgreSQL connection string pointing to the Docker container.

12. **`packages/nextjs/.env.example`** — Template environment file with empty `POSTGRES_URL` placeholder.

## Files Modified

13. **`packages/nextjs/package.json`** — Added dependencies (`@neondatabase/serverless`, `dotenv`, `drizzle-orm`, `pg`), devDependencies (`@types/pg`, `drizzle-kit`, `drizzle-seed`, `tsx`), and scripts (`db:seed`, `db:wipe`, `drizzle-kit`).

14. **`package.json`** (root) — Added proxy scripts (`db:seed`, `db:wipe`, `drizzle-kit`) that delegate to the nextjs workspace.

15. **`.gitignore`** — Added `data` directory to ignore Docker PostgreSQL volume data.

## Architecture

```
packages/nextjs/
  drizzle.config.ts                        # Drizzle Kit config
  .env.development                          # Local DB connection string
  .env.example                              # Template for env vars
  services/
    database/
      config/
        schema.ts                           # Table definitions
        postgresClient.ts                   # Smart DB client (auto-detects driver)
      repositories/
        users.ts                            # Typed CRUD functions
      migrations/                           # Generated migration files (via drizzle-kit generate)
      seed.ts                               # Seed script
      wipe.ts                               # Wipe script
    api/
      users.ts                              # Client-side API service
  app/
    users/
      page.tsx                              # Users page (Server Component)
    api/
      users/
        route.ts                            # REST API endpoint
docker-compose.yml                          # Local PostgreSQL via Docker
```

## How to Use

```bash
# Start local Postgres
docker compose up -d

# Push schema to database (development)
yarn drizzle-kit push

# Start the app
yarn start

# Visit http://localhost:3000/users

# Seed test data
yarn db:seed

# Open Drizzle Studio
yarn drizzle-kit studio

# Generate migrations (for production)
yarn drizzle-kit generate
yarn drizzle-kit migrate

# Wipe database
yarn db:wipe
```
