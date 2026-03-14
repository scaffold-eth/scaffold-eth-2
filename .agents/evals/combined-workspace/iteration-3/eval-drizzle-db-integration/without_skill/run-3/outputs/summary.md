# Drizzle ORM + Neon PostgreSQL Integration for SE-2

## What was built

A full off-chain PostgreSQL database integration using Drizzle ORM with Neon serverless PostgreSQL, including schema definition, database connection, CRUD API routes, client-side react-query hooks, a database management UI page, migration/seed scripts, and convenience npm scripts.

## Files Created

1. **`packages/nextjs/server/db/schema.ts`** - Drizzle schema defining a `users` table with columns: id, address (unique, linked to wallet), username, email, bio, points, createdAt, updatedAt. Exports `User` and `NewUser` types.

2. **`packages/nextjs/server/db/index.ts`** - Database connection module using `@neondatabase/serverless` neon HTTP driver with Drizzle ORM. Reads `DATABASE_URL` from environment.

3. **`packages/nextjs/drizzle.config.ts`** - Drizzle Kit configuration for schema generation, migrations, and Drizzle Studio.

4. **`packages/nextjs/server/db/migrate.ts`** - Standalone migration runner script using `drizzle-orm/neon-http/migrator`.

5. **`packages/nextjs/server/db/seed.ts`** - Seed script that populates the database with 3 sample users using hardhat default addresses.

6. **`packages/nextjs/app/api/users/route.ts`** - Next.js API route handling GET (list all / filter by address) and POST (create user with address validation, duplicate detection).

7. **`packages/nextjs/app/api/users/[id]/route.ts`** - Next.js API route handling GET (single user), PUT (update), and DELETE by user ID.

8. **`packages/nextjs/services/database/api.ts`** - Client-side API service layer with typed fetch functions: fetchUsers, fetchUserById, fetchUserByAddress, createUser, updateUser, deleteUser.

9. **`packages/nextjs/services/database/queries.ts`** - React-query hooks wrapping the API service: useUsers, useUserByAddress, useCreateUser, useUpdateUser, useDeleteUser. Includes query key factory and automatic cache invalidation on mutations.

10. **`packages/nextjs/app/database/page.tsx`** - Full database management page with create profile form (linked to connected wallet), users table with inline editing, delete functionality. Uses DaisyUI components and SE-2 patterns (Address component, notification system).

## Files Modified

11. **`packages/nextjs/components/Header.tsx`** - Added "Database" navigation link with CircleStackIcon to the header menu.

12. **`packages/nextjs/package.json`** - Added dependencies (drizzle-orm, @neondatabase/serverless) and devDependencies (drizzle-kit, dotenv, tsx). Added scripts: db:generate, db:migrate, db:push, db:seed, db:studio.

13. **`packages/nextjs/.env.example`** - Added DATABASE_URL environment variable with Neon setup instructions.

14. **`package.json`** (root) - Added root-level db:* scripts that proxy to the nextjs workspace.

## Setup Instructions

1. Create a Neon PostgreSQL database at https://neon.tech
2. Copy the connection string to `packages/nextjs/.env.local` as `DATABASE_URL`
3. Run `yarn db:push` to push the schema to the database (or `yarn db:generate` + `yarn db:migrate` for migration-based workflow)
4. Optionally run `yarn db:seed` to add sample data
5. Run `yarn start` and navigate to `/database`
