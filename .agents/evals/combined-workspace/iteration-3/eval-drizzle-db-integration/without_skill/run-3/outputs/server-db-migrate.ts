import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

// This script runs database migrations against your Neon PostgreSQL database.
// Usage: npx tsx server/db/migrate.ts

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set.");
    console.error("Get your Neon connection string at https://neon.tech");
    process.exit(1);
  }

  console.log("Running migrations...");

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("Migrations completed successfully!");
}

runMigrations().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
