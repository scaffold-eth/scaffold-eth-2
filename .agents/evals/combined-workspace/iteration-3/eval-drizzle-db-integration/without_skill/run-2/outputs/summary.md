# Drizzle ORM + Neon PostgreSQL Integration for SE-2

## What was built

A complete PostgreSQL database integration using Drizzle ORM with Neon's serverless driver, including schema definitions, migrations, API routes with full CRUD support, client-side React Query hooks, and a database management UI page.

## Architecture

- **Database Layer**: Drizzle ORM with `@neondatabase/serverless` HTTP driver for edge-compatible, serverless PostgreSQL access
- **Schema**: A `users` table linking Ethereum wallet addresses to off-chain profile data (name, email, bio, points)
- **API Layer**: Next.js App Router API routes (`/api/users`) with GET, POST, PUT, DELETE operations
- **Client Layer**: React Query-based hooks for data fetching with automatic cache invalidation
- **UI**: A `/database` page with profile creation/editing and a user listing table

## Files created

1. **`packages/nextjs/db/index.ts`** - Database connection singleton using Neon serverless driver and Drizzle ORM
2. **`packages/nextjs/db/schema.ts`** - Drizzle schema definition for the `users` table with typed exports
3. **`packages/nextjs/db/migrate.ts`** - Migration runner script for applying SQL migrations
4. **`packages/nextjs/db/seed.ts`** - Database seeding script with sample user data
5. **`packages/nextjs/db/migrations/0000_initial_users.sql`** - Initial SQL migration for the users table
6. **`packages/nextjs/db/migrations/meta/0000_snapshot.json`** - Drizzle migration snapshot metadata
7. **`packages/nextjs/db/migrations/meta/_journal.json`** - Drizzle migration journal
8. **`packages/nextjs/drizzle.config.ts`** - Drizzle Kit configuration for migrations and studio
9. **`packages/nextjs/app/api/users/route.ts`** - API route for listing all users (GET) and creating users (POST)
10. **`packages/nextjs/app/api/users/[address]/route.ts`** - API route for single user operations (GET, PUT, DELETE) by Ethereum address
11. **`packages/nextjs/services/database/types.ts`** - TypeScript types for API payloads and responses
12. **`packages/nextjs/services/database/api.ts`** - Client-side API service functions (fetch wrappers)
13. **`packages/nextjs/services/database/hooks.ts`** - React Query hooks (useUsers, useUser, useCreateUser, useUpdateUser, useDeleteUser)
14. **`packages/nextjs/services/database/index.ts`** - Barrel export for the database service layer
15. **`packages/nextjs/app/database/page.tsx`** - Database management page with profile CRUD UI

## Files modified

1. **`packages/nextjs/package.json`** - Added `drizzle-orm`, `@neondatabase/serverless` dependencies; `drizzle-kit` devDependency; database scripts (`db:generate`, `db:migrate`, `db:seed`, `db:studio`, `db:push`)
2. **`packages/nextjs/.env.example`** - Added `DATABASE_URL` environment variable
3. **`packages/nextjs/components/Header.tsx`** - Added "Database" navigation link with CircleStackIcon

## Setup instructions

1. Create a Neon PostgreSQL database at https://console.neon.tech
2. Copy the connection string and add it to `.env.local`:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
3. Run migrations: `yarn workspace @se-2/nextjs db:migrate`
4. (Optional) Seed sample data: `yarn workspace @se-2/nextjs db:seed`
5. Start the app: `yarn start`
6. Navigate to `/database` to manage user profiles

## Available scripts

- `db:generate` - Generate new migration files from schema changes
- `db:migrate` - Apply pending migrations to the database
- `db:seed` - Seed the database with sample data
- `db:studio` - Open Drizzle Studio for visual database management
- `db:push` - Push schema changes directly (for development)
