import * as schema from "./config/schema";
import { closeDb, getDb, PRODUCTION_DATABASE_HOSTNAME } from "./config/postgresClient";
import * as dotenv from "dotenv";
import { seed } from "drizzle-seed";

dotenv.config({ path: ".env.development" });

async function main() {
  if (process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME)) {
    console.error("Cannot seed production database. Aborting.");
    process.exit(1);
  }

  const db = getDb();

  await seed(db as Parameters<typeof seed>[0], schema);
  console.log("Database seeded successfully.");
  await closeDb();
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
