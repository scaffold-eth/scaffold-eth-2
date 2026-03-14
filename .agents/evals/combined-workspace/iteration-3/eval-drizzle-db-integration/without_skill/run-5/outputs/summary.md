# Drizzle ORM + Neon PostgreSQL Integration

## What was built

Full off-chain PostgreSQL database integration for SE-2 using Drizzle ORM with Neon serverless PostgreSQL, including schema definition, migrations, CRUD API routes, client-side react-query hooks, and a user management UI page.

## Files created

### Database layer
- `packages/nextjs/server/db/schema.ts` - Drizzle schema defining a `users` table with fields: id, address (unique, varchar(42)), username, email, bio, createdAt, updatedAt. Exports `User` and `NewUser` inferred types.
- `packages/nextjs/server/db/index.ts` - Database connection using `@neondatabase/serverless` and `drizzle-orm/neon-http`. Reads `DATABASE_URL` from environment.
- `packages/nextjs/drizzle.config.ts` - Drizzle Kit configuration for migration generation, push, and studio commands.

### Migrations
- `packages/nextjs/server/db/migrations/0000_init_users.sql` - Initial SQL migration creating the users table.
- `packages/nextjs/server/db/migrations/meta/0000_snapshot.json` - Drizzle Kit snapshot metadata.
- `packages/nextjs/server/db/migrations/meta/_journal.json` - Drizzle Kit migration journal.

### API routes (Next.js App Router)
- `packages/nextjs/app/api/users/route.ts` - `GET /api/users` (list all) and `POST /api/users` (create with address validation and uniqueness check).
- `packages/nextjs/app/api/users/[id]/route.ts` - `GET /api/users/:id` (read one), `PUT /api/users/:id` (update), `DELETE /api/users/:id` (delete).

### Client-side service layer
- `packages/nextjs/services/database/api.ts` - Typed fetch wrapper functions for all CRUD operations.
- `packages/nextjs/services/database/hooks.ts` - React Query hooks: `useUsers`, `useUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser` with automatic cache invalidation.
- `packages/nextjs/services/database/index.ts` - Barrel export.

### UI
- `packages/nextjs/app/users/page.tsx` - Full user management page with registration form (auto-fills connected wallet address), edit/delete functionality, and a table listing all registered users. Uses DaisyUI components and SE-2 notification system.

## Files modified
- `packages/nextjs/package.json` - Added `drizzle-orm`, `@neondatabase/serverless` as dependencies and `drizzle-kit` as devDependency. Added `db:generate`, `db:migrate`, `db:push`, and `db:studio` scripts.
- `packages/nextjs/.env.example` - Added `DATABASE_URL` environment variable placeholder.
- `packages/nextjs/components/Header.tsx` - Added "Users" navigation link with UserGroupIcon.

## Setup instructions
1. Create a Neon PostgreSQL database at https://neon.tech
2. Copy the connection string to `packages/nextjs/.env.local` as `DATABASE_URL`
3. Run `yarn db:push` (from packages/nextjs) to create tables, or `yarn db:migrate` to apply migration files
4. Start the app with `yarn start` and navigate to `/users`
