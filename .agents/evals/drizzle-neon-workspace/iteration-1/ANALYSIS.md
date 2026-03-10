# drizzle-neon -- Database Integration: Detailed Analysis

## Score: 100% with skill | 0% without skill | Delta: +100% (LARGEST)

## Efficiency

| Metric | With Skill | Without Skill | Diff |
|--------|-----------|---------------|------|
| Time | 220s (3m 40s) | 189s (3m 9s) | +31s (16% slower) |
| Tokens | 46,554 | 38,464 | +8,090 (21% more) |
| Tool calls | 50 | 45 | +5 (11% more) |

**Notable:** This is the only skill where the with-skill variant was *slower* and used *more* tokens. The skill guided the model to implement more things (tri-driver, Docker, safety guards, repositories) which took more work. Without the skill, the model did less -- but everything it did was wrong for SE-2. Speed doesn't matter if the output is unusable.

## Assertion Breakdown

### ALL 10 assertions are discriminating -- 0/10 without skill

Every single assertion failed without the skill. This is the starkest result across all 4 evals. The model independently chose Drizzle + Neon (good library selection!) but missed every SE-2 integration pattern.

1. **Tri-driver pattern (Neon serverless / HTTP / pg)** -- The skill teaches a critical multi-environment architecture: Neon WebSocket pool for serverless edge functions (detected via `NEXT_RUNTIME`), Neon HTTP for migration scripts, and local `pg` Pool for Docker development. Without the skill, the model used only `neon-http` -- which means: no local development, no serverless optimization, and scripts use the wrong driver. This would break in 2 of 3 environments.

2. **Lazy proxy for deferred connection** -- The skill uses a `Proxy` object pattern where the DB connection is created lazily on first property access. Without the skill, the model does eager initialization (`const db = drizzle(...)` at module level) which throws immediately if `DATABASE_URL` isn't set. In Next.js, modules are imported during build time -- this would crash `next build` in CI where no database is available.

3. **casing: 'snake_case' in BOTH config AND client** -- This is the most insidious failure. Drizzle uses camelCase by default for column names, but PostgreSQL convention is snake_case. If `casing: 'snake_case'` is set in `drizzle.config.ts` (for migrations) but NOT in the `drizzle()` client call, the migration creates `snake_case` columns but the runtime queries look for `camelCase` columns. Result: **silent data corruption** -- queries return empty results or wrong data with no errors. The model missed this in both locations.

4. **Files at services/database/ path** -- SE-2 convention puts database files under `services/database/`. The model used `/db/` -- a common convention in generic tutorials but wrong for SE-2. This matters for discoverability and consistency with other SE-2 extensions.

5. **Repository pattern for DB access** -- The skill establishes a `repositories/` layer (e.g., `repositories/users.ts` with `getAllUsers`, `getUserById`, etc.). Without the skill, queries are inline in API routes -- harder to test, reuse, and maintain.

6. **Root proxy scripts** -- SE-2 monorepo convention: database commands (`drizzle-kit`, `db:seed`, `db:wipe`) should be accessible from the project root via proxy scripts. Without the skill, scripts only exist in `packages/nextjs/package.json`, forcing developers to `cd` into the package.

7. **Docker Compose for local development** -- The skill creates a `docker-compose.yml` with postgres:16 so developers can `docker compose up` for local dev. Without the skill, there's no local development story at all -- the model assumed an always-available Neon cloud database.

8. **.env.development (SE-2 convention)** -- SE-2 uses `.env.development` (auto-loaded by Next.js in dev mode). The model used `.env.example` + `.env.local` -- a common pattern but not SE-2's convention. Developers familiar with SE-2 would look in the wrong place.

9. **Production safety guard** -- The skill adds a `PRODUCTION_DATABASE_HOSTNAME` constant that seed/wipe scripts check before running. Without this guard, running `db:wipe` with a production DATABASE_URL would **destroy production data**. The model created seed/wipe scripts with no safety check.

10. **All required dependencies** -- Missing `pg` (no local driver), `dotenv` (can't load env files for scripts), `@types/pg` (TypeScript errors), and `drizzle-seed` (seed script won't work). 4 of 8 required packages absent.

## Root Cause Analysis

This is fundamentally different from x402's "stale API" problem. The model's Drizzle and Neon knowledge is current -- it correctly uses `drizzle-orm`, `@neondatabase/serverless`, and knows the basic API. What it misses entirely is the **integration layer**:

- How Drizzle should be configured for Next.js's multiple runtimes (Edge, Node, build)
- How the database layer fits into SE-2's monorepo conventions
- Safety patterns for production databases
- Local development infrastructure (Docker)

These are patterns that don't exist in any Drizzle or Neon tutorial -- they're specific to the intersection of SE-2 + Drizzle + Neon + Next.js runtimes. The skill encodes hard-won integration knowledge.

## Key Takeaway

drizzle-neon demonstrates the **integration knowledge gap** pattern. The model knows both Drizzle and Neon individually, but the skill's value is entirely in how they fit together within SE-2. Library knowledge is necessary but not sufficient -- integration is where real-world projects succeed or fail. The 100% delta (largest of all skills) proves this is the area where skills provide the most value.
