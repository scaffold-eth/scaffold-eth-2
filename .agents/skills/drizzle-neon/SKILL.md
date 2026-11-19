---
name: drizzle-neon
description: "Add a PostgreSQL database with Drizzle ORM to a Scaffold-ETH 2 project. Use when the user wants to: add a database, use Drizzle ORM, integrate Neon PostgreSQL, store off-chain data, build a backend with database, or add persistent storage to their dApp."
---

# Drizzle ORM + Neon PostgreSQL Integration for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Overview

[Drizzle ORM](https://orm.drizzle.team/) is a TypeScript ORM for SQL databases with a type-safe query builder. [Neon](https://neon.com/) is a serverless PostgreSQL platform. This skill integrates both into SE-2's Next.js package, with a database client that picks the right driver for the environment: local Postgres via Docker in development, Neon in production.

For Drizzle API reference beyond what's covered here, see the [Drizzle docs](https://orm.drizzle.team/docs/overview). For Neon specifics, see the [Neon docs](https://neon.com/docs). This skill focuses on SE-2 integration patterns. The file layout below (`services/database/...`) is a suggestion — adapt it to what the project already has.

## Dependencies & Scripts

### NextJS package

```bash
yarn workspace @se-2/nextjs add drizzle-orm pg @neondatabase/serverless dotenv
yarn workspace @se-2/nextjs add -D drizzle-kit drizzle-seed @types/pg tsx
```

Drizzle 1.0 is in release-candidate stage with API changes (e.g. relational queries v2). The snippets below target the current stable 0.x line; if the project is on 1.x, check the Drizzle docs for differences.

Add scripts to `packages/nextjs/package.json`:

```json
{
  "scripts": {
    "db:seed": "tsx services/database/seed.ts",
    "db:wipe": "tsx services/database/wipe.ts",
    "drizzle-kit": "drizzle-kit"
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

Put the connection string in `packages/nextjs/.env.local`. SE-2's `.env.example` uses `.env.local` for local values, and it's gitignored — `.env.development` is **not**, so don't put credentials there:

```env
POSTGRES_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
```

Also add `POSTGRES_URL=` to `packages/nextjs/.env.example`. Next.js loads `.env.local` automatically; standalone scripts (`drizzle-kit`, seed, wipe) load it explicitly with `dotenv`.

### Docker Compose (local development)

Create `docker-compose.yml` at the project root:

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: mysecretpassword
    ports:
      - "5432:5432" # change the host port (e.g. "5433:5432") if 5432 is taken, and update POSTGRES_URL
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

A named volume keeps data out of the repo; `docker compose down -v` deletes it.

## Database Client

The client lives at `packages/nextjs/services/database/config/postgresClient.ts` and picks the driver from the connection string and runtime:

| Connection host | Runtime | Driver | Why |
|-----------------|---------|--------|-----|
| `*.neon.tech` | Next.js (`NEXT_RUNTIME` set) | `drizzle-orm/neon-serverless` | WebSocket pool, works in serverless functions, supports transactions |
| `*.neon.tech` | Scripts (no `NEXT_RUNTIME`) | `drizzle-orm/neon-http` | One HTTP request per query, supports `batch()` |
| anything else | Any | `drizzle-orm/node-postgres` | Standard `pg` Pool for local/other Postgres |

Detect Neon by hostname, not by the database name (`neondb` is only Neon's default database name and can be changed).

Reference implementation:

```typescript
// packages/nextjs/services/database/config/postgresClient.ts
import * as schema from "./schema";
import { Pool as NeonPool, neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Hostname of the production database. Seed/wipe scripts refuse to run against it.
export const PRODUCTION_DATABASE_HOSTNAME = "your-production-database-hostname";

const getDatabaseUrl = () => {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("POSTGRES_URL is not set");
  return url;
};

const isNeonUrl = (url: string) => new URL(url).hostname.endsWith(".neon.tech");

// Neon serves the same database on a direct host and a pooled one (`ep-xxx-pooler...`): treat both as production
const normalizeHost = (host: string) => host.replace("-pooler.", ".");
export const isProductionDatabase = () =>
  normalizeHost(new URL(getDatabaseUrl()).hostname) === normalizeHost(PRODUCTION_DATABASE_HOSTNAME);

// All three drivers expose the same query API; type the instance as one of them.
type Db = ReturnType<typeof drizzle<typeof schema>>;

let dbInstance: Db | null = null;
let poolInstance: Pool | NeonPool | null = null;

export function getDb(): Db {
  if (dbInstance) return dbInstance;

  const url = getDatabaseUrl();

  if (isNeonUrl(url)) {
    if (process.env.NEXT_RUNTIME) {
      const pool = new NeonPool({ connectionString: url });
      poolInstance = pool;
      dbInstance = drizzleNeon({ client: pool, schema, casing: "snake_case" }) as unknown as Db;
    } else {
      dbInstance = drizzleNeonHttp({ client: neon(url), schema, casing: "snake_case" }) as unknown as Db;
    }
  } else {
    const pool = new Pool({ connectionString: url });
    poolInstance = pool;
    dbInstance = drizzle({ client: pool, schema, casing: "snake_case" });
  }

  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (poolInstance) await poolInstance.end();
  poolInstance = null;
  dbInstance = null;
}

// Lazy proxy: importing `db` doesn't connect until it's first used
export const db = new Proxy({} as Db, {
  get: (_, prop) => getDb()[prop as keyof Db],
});
```

## Schema Definition

```typescript
// packages/nextjs/services/database/config/schema.ts
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(), // column: created_at (casing: "snake_case")
});
```

For the full column types and schema API, see [Drizzle schema docs](https://orm.drizzle.team/docs/sql-schema-declaration).

## Drizzle Config

```typescript
// packages/nextjs/drizzle.config.ts
import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

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

> **Important:** `casing: "snake_case"` must be set in **both** `drizzle.config.ts` and every `drizzle()` client initialization. It maps camelCase TypeScript keys to snake_case column names; if the two disagree, drizzle-kit creates columns the client can't find.

## Data Access

Keeping queries in small per-entity modules (e.g. `services/database/repositories/users.ts`) keeps them out of components and route handlers. Follow the project's existing structure if it has one.

```typescript
// packages/nextjs/services/database/repositories/users.ts
import { desc, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { users } from "~~/services/database/config/schema";

export type NewUser = typeof users.$inferInsert;

export async function getAllUsers() {
  return db.query.users.findMany({ orderBy: [desc(users.createdAt)] });
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export async function createUser(user: NewUser) {
  const [created] = await db.insert(users).values(user).returning();
  return created;
}
```

## Using the Database in Next.js

Server Components can call data-access functions directly — no API route needed:

```tsx
// packages/nextjs/app/users/page.tsx
import { getAllUsers } from "~~/services/database/repositories/users";

export const dynamic = "force-dynamic"; // read fresh data on every request

const UsersPage = async () => {
  const users = await getAllUsers();
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

export default UsersPage;
```

For mutations from client components, use a Server Action or an API route:

```typescript
// packages/nextjs/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUser } from "~~/services/database/repositories/users";

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const user = await createUser({ name });
  return NextResponse.json(user, { status: 201 });
}
```

SE-2 already includes `@tanstack/react-query` — use `useQuery` / `useMutation` on the client against these routes.

## Seed and Wipe Scripts

Both scripts run outside Next.js, so they load `.env.local` themselves and refuse to touch the production database:

```typescript
// packages/nextjs/services/database/seed.ts
import * as dotenv from "dotenv";
import { seed } from "drizzle-seed";
import { closeDb, getDb, isProductionDatabase } from "./config/postgresClient";
import { users } from "./config/schema";

dotenv.config({ path: ".env.local" });

async function main() {
  if (isProductionDatabase()) throw new Error("Refusing to seed the production database");
  await seed(getDb(), { users }, { count: 10 });
  console.log("Database seeded");
}

main()
  .catch(e => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(closeDb);
```

```typescript
// packages/nextjs/services/database/wipe.ts
import * as dotenv from "dotenv";
import { reset } from "drizzle-seed";
import { closeDb, getDb, isProductionDatabase } from "./config/postgresClient";
import { users } from "./config/schema";

dotenv.config({ path: ".env.local" });

async function main() {
  if (isProductionDatabase()) throw new Error("Refusing to wipe the production database");
  await reset(getDb(), { users });
  console.log("Database wiped");
}

main()
  .catch(e => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(closeDb);
```

Pass `getDb()` (the real instance), not the `db` proxy, to `drizzle-seed`. Add new tables to the objects passed to `seed`/`reset` as the schema grows.

## Database Workflow

```bash
# Development (fast, no migrations)
docker compose up -d                  # Start local Postgres
yarn drizzle-kit push                 # Push schema directly to DB
yarn drizzle-kit studio               # Open Drizzle Studio UI
yarn db:seed                          # Seed with test data
yarn db:wipe                          # Empty all seeded tables

# Production (stable schema)
yarn drizzle-kit generate             # Generate SQL migration files
yarn drizzle-kit migrate              # Apply migrations to DB
```

Use `push` during active development. Switch to `generate` + `migrate` once the schema is stable, and commit the migration files. Never use `push` against production.

## Gotchas & Common Pitfalls

**Credentials belong in `.env.local`.** It's gitignored; `.env.development` isn't. In production, set `POSTGRES_URL` in the hosting provider's environment settings.

**Don't import the `db` client in client components.** It only works server-side (Server Components, Route Handlers, Server Actions).

**Docker must be running for local development.** If `docker compose up -d` hasn't been run, connections to `localhost:5432` fail with `ECONNREFUSED`.

**Port 5432 is popular.** Another local Postgres may already use it. Map a different host port in `docker-compose.yml` and update `POSTGRES_URL` to match.

**`sslmode` warning from `drizzle-kit` with Neon.** `drizzle-kit` connects through `pg`, which warns that `sslmode=require` (the default in Neon's connection string) will change meaning in pg v9. It's harmless; `sslmode=verify-full` keeps the current, stricter behavior and silences it.

**Production safety guard.** Set `PRODUCTION_DATABASE_HOSTNAME` in `postgresClient.ts` to the production database host so seed/wipe refuse to run against it.

## How to Test

1. `docker compose up -d` — start local Postgres
2. `yarn drizzle-kit push` — apply the schema
3. `yarn db:seed` — insert test data
4. `yarn start` — visit `http://localhost:3000/users` to see the seeded users
5. `curl -X POST localhost:3000/api/users -H 'Content-Type: application/json' -d '{"name":"Alice"}'` — create a user through the API route
6. `yarn drizzle-kit studio` — inspect data at `https://local.drizzle.studio`

### Production (Neon)

1. Create a Neon project at [neon.com](https://neon.com/)
2. Set `POSTGRES_URL` to the Neon connection string (host ends in `.neon.tech`) in the hosting provider's env settings
3. Set `PRODUCTION_DATABASE_HOSTNAME` in `postgresClient.ts` to that host
4. Apply the committed migrations to it: `POSTGRES_URL="<neon connection string>" yarn drizzle-kit migrate` (from `packages/nextjs`). `drizzle.config.ts` loads `.env.local`, which points to the local database; a `POSTGRES_URL` already set in the environment takes precedence
5. The client switches to Neon's drivers automatically based on the host
