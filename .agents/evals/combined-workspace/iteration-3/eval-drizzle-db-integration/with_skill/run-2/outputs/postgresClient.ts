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

const dbProxy = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (prop === "close") return closeDb;
      const db = getDb();
      return db[prop as keyof typeof db];
    },
  },
);

export const db = dbProxy as ReturnType<typeof getDb> & { close: () => Promise<void> };
