import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

/**
 * Run database migrations against Neon PostgreSQL.
 * Usage: npx tsx db/migrate.ts
 */
async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("Running migrations...");

  await migrate(db, { migrationsFolder: "./db/migrations" });

  console.log("Migrations completed successfully.");
}

runMigrations().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
