import * as dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

import * as schema from "./config/schema";
import { PRODUCTION_DATABASE_HOSTNAME, getDb, closeDb } from "./config/postgresClient";
import { seed } from "drizzle-seed";

async function main() {
  if (process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME)) {
    console.error("Cannot seed production database. Aborting.");
    process.exit(1);
  }

  const db = getDb();
  await seed(db, schema);
  console.log("Database seeded successfully.");
  await closeDb();
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
