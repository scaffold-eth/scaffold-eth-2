---
name: drizzle-neon
description: "Add a PostgreSQL database with Drizzle ORM to a Scaffold-ETH 2 project. Use when the user wants to: add a database, use Drizzle ORM, integrate Neon PostgreSQL, store off-chain data, build a backend with database, or add persistent storage to their dApp."
---

# Drizzle ORM + Neon PostgreSQL Integration for Scaffold-ETH 2

## Prerequisites

Check if `./packages/nextjs/scaffold.config.ts` exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## Overview

[Drizzle ORM](https://orm.drizzle.team/) is a TypeScript ORM for SQL databases with a type-safe query builder. [Neon](https://neon.tech/) is a serverless PostgreSQL platform. This skill integrates both into SE-2, with a smart database client that auto-detects the environment (local Postgres via Docker, Neon serverless, or Neon HTTP) and uses the optimal driver.

For Drizzle API reference beyond what's covered here, refer to the [Drizzle docs](https://orm.drizzle.team/docs/overview). For Neon specifics, see the [Neon docs](https://neon.tech/docs). This skill focuses on SE-2 integration patterns and the tri-driver architecture.

## Dependencies & Scripts

### NextJS package

Add to `packages/nextjs/package.json`:

```json
{
  "scripts": {
    "db:seed": "tsx services/database/seed.ts",
    "db:wipe": "tsx services/database/wipe.ts",
    "drizzle-kit": "drizzle-kit"
  },
  "dependencies": {
    "@neondatabase/serverless": "^1.0.0",
    "dotenv": "^17.0.0",
    "drizzle-orm": "^0.44.0",
    "pg": "^8.16.0"
  },
  "devDependencies": {
    "@types/pg": "^8",
    "drizzle-kit": "^0.31.0",
    "drizzle-seed": "^0.3.0",
    "tsx": "^4.20.0"
  }
}
```

### Root package.json scripts

```json
{
  "drizzle-kit": "yarn workspace @se-2/nextjs drizzle-kit",
  "db:seed": "yarn workspace @se-2/nextjs db:seed",
  "db:wipe": "yarn workspace @se-2/nextjs db:wipe"
}
```

### Environment variables

Create `packages/nextjs/.env.development`:

```env
POSTGRES_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
```

Also add `POSTGRES_URL=` to `packages/nextjs/.env.example`.

### Docker Compose (local development)

Create `docker-compose.yml` at project root:

```yaml
version: "3"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: mysecretpassword
    ports:
      - "5432:5432"
    volumes:
      - ./data/db:/var/lib/postgresql/data
```

Add `data` to `.gitignore`.

## Database Client Architecture

The key integration piece is a smart database client at `packages/nextjs/services/database/config/postgresClient.ts` that auto-selects the right Postgres driver based on the connection string and runtime:

| Connection URL contains | Runtime | Driver used | Why |
|------------------------|---------|-------------|-----|
| `neondb` | Next.js (`NEXT_RUNTIME` set) | `drizzle-orm/neon-serverless` | WebSocket-based, works in serverless |
| `neondb` | Scripts (no `NEXT_RUNTIME`) | `drizzle-orm/neon-http` | Supports `batch()` for bulk operations |
| anything else | Any | `drizzle-orm/node-postgres` | Standard `pg` Pool for local/other Postgres |

This matters because Neon's serverless driver uses WebSockets (required in edge/serverless runtimes), while the HTTP driver is better for scripts that need batch operations. For local development with Docker, the standard `pg` driver is used.

Reference implementation:

```typescript
// packages/nextjs/services/database/config/postgresClient.ts
import * as schema from "./schema";
import { Pool as NeonPool, neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const PRODUCTION_DATABASE_HOSTNAME = "your-production-database-hostname";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let poolInstance: Pool | NeonPool | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const isNextRuntime = !!process.env.NEXT_RUNTIME;

  if (process.env.POSTGRES_URL?.includes("neondb")) {
    if (isNextRuntime) {
      poolInstance = new NeonPool({ connectionString: process.env.POSTGRES_URL });
      dbInstance = drizzleNeon(poolInstance as NeonPool, { schema, casing: "snake_case" });
    } else {
      const sql = neon(process.env.POSTGRES_URL);
      dbInstance = drizzleNeonHttp({ client: sql, schema, casing: "snake_case" });
    }
  } else {
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    poolInstance = pool;
    dbInstance = drizzle(pool, { schema, casing: "snake_case" });
  }

  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
    dbInstance = null;
  }
}
```

Expose the client as a lazy proxy so imports don't eagerly connect:

```typescript
// Same file, bottom
const dbProxy = new Proxy({}, {
  get: (_, prop) => {
    if (prop === "close") return closeDb;
    const db = getDb();
    return db[prop as keyof typeof db];
  },
});

export const db = dbProxy as ReturnType<typeof getDb> & { close: () => Promise<void> };
```

## Schema Definition

Define tables in `packages/nextjs/services/database/config/schema.ts`:

```typescript
// packages/nextjs/services/database/config/schema.ts
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
});
```

For the full column types and schema API, see [Drizzle schema docs](https://orm.drizzle.team/docs/sql-schema-declaration).

## Drizzle Config

The `drizzle.config.ts` at `packages/nextjs/` configures Drizzle Kit for migrations and studio:

```typescript
// packages/nextjs/drizzle.config.ts
import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.development" });

export default defineConfig({
  schema: "./services/database/config/schema.ts",
  out: "./services/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL as string,
  },
  casing: "snake_case",
});
```

> **Important:** `casing: "snake_case"` must be set in **both** `drizzle.config.ts` and the `drizzle()` client initialization. This tells Drizzle to convert camelCase TypeScript property names to snake_case column names. If they don't match, queries will fail silently or return wrong data.

## Repository Pattern

Use a repository pattern at `packages/nextjs/services/database/repositories/`. Each entity gets its own file with typed CRUD functions:

```typescript
// packages/nextjs/services/database/repositories/users.ts
import { users } from "../config/schema";
import type { InferInsertModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";

export type User = InferInsertModel<typeof users>;

export async function getAllUsers() {
  return await db.query.users.findMany();
}

export async function getUserById(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function createUser(user: User) {
  return await db.insert(users).values(user);
}
```

## Using the Database in Next.js

Server components can import repository functions directly — no API route needed:

```typescript
// packages/nextjs/app/users/page.tsx — Server Component
import { getAllUsers, createUser } from "~~/services/database/repositories/users";

const users = await getAllUsers(); // Direct DB access in server components
```

For client-side mutations, create an API route that calls the repository:

```typescript
// packages/nextjs/app/api/users/route.ts
import { createUser } from "~~/services/database/repositories/users";

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  const user = await createUser({ name });
  return NextResponse.json(user);
}
```

SE-2 already includes `@tanstack/react-query` — use `useQuery` and `useMutation` for client-side data fetching and mutations against these API routes.

## Database Workflow

```bash
# Development (fast, no migrations)
docker compose up -d                  # Start local Postgres
yarn drizzle-kit push                 # Push schema directly to DB
yarn drizzle-kit studio               # Open Drizzle Studio UI
yarn db:seed                          # Seed with test data
yarn db:wipe                          # Reset all tables

# Production (stable schema)
yarn drizzle-kit generate             # Generate SQL migration files
yarn drizzle-kit migrate              # Apply migrations to DB
```

Use `push` during active development. Switch to `generate` + `migrate` when the schema is stable. Never use `push` in production.

## Gotchas & Common Pitfalls

**`casing: "snake_case"` must match everywhere.** Set it in both `drizzle.config.ts` and every `drizzle()` client call. Mismatched casing causes queries to reference wrong column names.

**Don't import the `db` client in client components.** The database client only works server-side (Server Components, API routes, Server Actions). For client-side mutations, use API routes or Server Actions.

**Docker must be running for local development.** If `docker compose up` hasn't been run, the database connection will fail. The `.env.development` points to `localhost:5432`.

**Production safety guard.** The seed/wipe scripts should check if the connection URL points to production (via `PRODUCTION_DATABASE_HOSTNAME`). Update `your-production-database-hostname` in `postgresClient.ts` to your actual Neon project hostname to enable this protection.

**Use `.env.development` not `.env.local`.** SE-2 convention is `.env.development` for local env vars.

## How to Test

1. `docker compose up -d` — start local Postgres
2. `yarn drizzle-kit push` — apply schema to local DB
3. `yarn start` — start Next.js
4. Visit the users page — should show empty list, add a user via the form
5. `yarn db:seed` — seed with test data
6. `yarn drizzle-kit studio` — inspect data at `https://local.drizzle.studio`

### Production (Neon)

1. Create a Neon project at [neon.tech](https://neon.tech/)
2. Set `POSTGRES_URL` to the Neon connection string (contains `neondb`)
3. Update `PRODUCTION_DATABASE_HOSTNAME` in `postgresClient.ts` to your Neon project hostname
4. Run `yarn drizzle-kit generate` then `yarn drizzle-kit migrate`
5. The database client auto-switches to Neon's serverless driver
