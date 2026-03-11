import * as dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

import * as schema from "./config/schema";
import { PRODUCTION_DATABASE_HOSTNAME, getDb, closeDb } from "./config/postgresClient";
import { reset } from "drizzle-seed";

async function main() {
  if (process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME)) {
    console.error("Cannot wipe production database. Aborting.");
    process.exit(1);
  }

  const db = getDb();
  await reset(db, schema);
  console.log("Database wiped successfully.");
  await closeDb();
}

main().catch(err => {
  console.error("Wipe failed:", err);
  process.exit(1);
});
