---
name: drizzle-neon
description: "Use when the user wants to store off-chain data in a database: PostgreSQL with Drizzle ORM, on Neon in production."
---

# Drizzle ORM + Neon PostgreSQL Integration for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Overview

[Drizzle ORM](https://orm.drizzle.team/) is a type-safe TypeScript ORM; [Neon](https://neon.com/) is serverless PostgreSQL. This skill adds both to SE-2's Next.js package: local Postgres (Docker) in development, Neon in production.

This skill covers the SE-2 glue; for the rest, see the [Drizzle docs](https://orm.drizzle.team/docs/overview) and the [Neon docs](https://neon.com/docs). The snippets target the current stable release (0.x, what `yarn add` installs); Drizzle 1.0 is still a release candidate, so if the project is on 1.x, check the docs for API changes. The `services/database/...` layout is a suggestion; follow the project's structure if it has one.

## Setup

```bash
yarn workspace @se-2/nextjs add drizzle-orm pg @neondatabase/serverless dotenv
yarn workspace @se-2/nextjs add -D drizzle-kit drizzle-seed @types/pg tsx
```

Add scripts to `packages/nextjs/package.json` (`"drizzle-kit": "drizzle-kit"`, `"db:seed": "tsx services/database/seed.ts"`, `"db:wipe": "tsx services/database/wipe.ts"`) and root scripts that forward to them (`"db:seed": "yarn workspace @se-2/nextjs db:seed"`, and likewise for `drizzle-kit` and `db:wipe`).

Put the connection string in `packages/nextjs/.env.local`, which is gitignored (`.env.development` isn't), and add `POSTGRES_URL=` to `.env.example`. Next.js loads `.env.local` automatically; the standalone scripts below load it with `dotenv`.

```env
POSTGRES_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
```

Local Postgres, in `docker-compose.yml` at the project root:

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: mysecretpassword
    ports:
      - "5432:5432" # change the host port (e.g. "5433:5432") if 5432 is taken, and update POSTGRES_URL
    volumes:
      - db-data:/var/lib/postgresql/data # named volume: `docker compose down -v` deletes it

volumes:
  db-data:
```

## Database Client

The client picks the driver from the connection host and the runtime:

| Connection host | Runtime | Driver | Why |
|-----------------|---------|--------|-----|
| `*.neon.tech` | Next.js (`NEXT_RUNTIME` set) | `drizzle-orm/neon-serverless` | WebSocket pool, works in serverless functions, supports transactions |
| `*.neon.tech` | Scripts (no `NEXT_RUNTIME`) | `drizzle-orm/neon-http` | One HTTP request per query, supports `batch()` |
| anything else | Any | `drizzle-orm/node-postgres` | Standard `pg` Pool for local/other Postgres |

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

// Detect Neon by hostname: `neondb` is only Neon's default database name and can be changed
const isNeonUrl = (url: string) => new URL(url).hostname.endsWith(".neon.tech");

// Neon serves the same database on a direct host and a pooled one (`ep-xxx-pooler...`): treat both as production
const normalizeHost = (host: string) => host.replace("-pooler.", ".");
export const isProductionDatabase = () =>
  normalizeHost(new URL(getDatabaseUrl()).hostname) === normalizeHost(PRODUCTION_DATABASE_HOSTNAME);

// All three drivers expose the same query API; type the instance as one of them.
// The type is node-postgres's: neon-http's batch() isn't on it, and db.transaction() type-checks but throws on neon-http.
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

Define the tables with `pgTable` in `services/database/config/schema.ts` ([schema docs](https://orm.drizzle.team/docs/sql-schema-declaration)); with `casing: "snake_case"`, a `createdAt` key becomes a `created_at` column.

## Drizzle Config

```typescript
// packages/nextjs/drizzle.config.ts
import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" }); // doesn't override a POSTGRES_URL already set in the environment

export default defineConfig({
  schema: "./services/database/config/schema.ts",
  out: "./services/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL as string,
  },
  // Must match every drizzle() client above, or drizzle-kit creates columns the client can't find
  casing: "snake_case",
});
```

## Using the Database in Next.js

- Keep queries in small per-entity modules (e.g. `services/database/repositories/users.ts`) that import `db`, and call them from server code only: Server Components, Route Handlers, Server Actions
- Pages that read the database need `export const dynamic = "force-dynamic"`. Otherwise `next build` prerenders them and serves the data as it was at build time
- For mutations from client components, use a Server Action or a Route Handler, with `useQuery` / `useMutation` from TanStack Query (already in SE-2) on the client

## Seed and Wipe Scripts

They run outside Next.js, so they load `.env.local` themselves and refuse to touch the production database:

```typescript
// packages/nextjs/services/database/seed.ts
import { closeDb, getDb, isProductionDatabase } from "./config/postgresClient";
import { users } from "./config/schema";
import * as dotenv from "dotenv";
import { seed } from "drizzle-seed";

dotenv.config({ path: ".env.local" });

async function main() {
  if (isProductionDatabase()) throw new Error("Refusing to seed the production database");
  // Pass the real instance from getDb(), not the `db` proxy. Add new tables here as the schema grows.
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

`wipe.ts` is the same with `reset(getDb(), { users })` from `drizzle-seed`, and "Refusing to wipe" in the guard.

## Database Workflow

```bash
docker compose up -d        # start local Postgres
yarn drizzle-kit push       # development: push the schema directly, no migrations
yarn drizzle-kit studio     # browse the data at https://local.drizzle.studio
yarn db:seed                # insert test data
yarn db:wipe                # remove it
yarn drizzle-kit generate   # stable schema: write SQL migrations (commit them)
yarn drizzle-kit migrate    # apply migrations; the only way to change production
```

**`sslmode` warning from `drizzle-kit` with Neon.** `drizzle-kit` connects through `pg`, which warns that `sslmode=require` (the default in Neon's connection string) will change meaning in pg v9. It's harmless; `sslmode=verify-full` keeps the current, stricter behavior and silences it.

## Done When

With local Postgres running, run each check and report what you saw:

1. `yarn drizzle-kit push` applies the schema without errors
2. `yarn db:seed` inserts rows, and `yarn db:wipe` removes them
3. With `PRODUCTION_DATABASE_HOSTNAME` temporarily set to the database host in `POSTGRES_URL`, both scripts refuse to run
4. With `yarn start`, a page that reads the database shows the rows, and a write through the Route Handler or Server Action shows up after a reload

## Production (Neon)

1. Create a Neon project at [neon.com](https://neon.com/)
2. Set `POSTGRES_URL` to the Neon connection string (host ends in `.neon.tech`) in the hosting provider's env settings
3. Set `PRODUCTION_DATABASE_HOSTNAME` in `postgresClient.ts` to that host
4. Apply the committed migrations from `packages/nextjs`: `POSTGRES_URL="<neon connection string>" yarn drizzle-kit migrate`
