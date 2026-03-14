import { closeDb, getDb, PRODUCTION_DATABASE_HOSTNAME } from "./config/postgresClient";
import * as schema from "./config/schema";
import { reset } from "drizzle-seed";
import "dotenv/config";

async function main() {
  if (process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME)) {
    console.error("Cannot wipe production database. Aborting.");
    process.exit(1);
  }

  const db = getDb();

  console.log("Wiping database...");
  await reset(db, schema);
  console.log("Database wiped.");

  await closeDb();
}

main().catch(err => {
  console.error("Wipe failed:", err);
  process.exit(1);
});
