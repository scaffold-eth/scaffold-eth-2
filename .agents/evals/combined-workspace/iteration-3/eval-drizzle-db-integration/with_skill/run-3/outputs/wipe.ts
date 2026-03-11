import * as dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

import { PRODUCTION_DATABASE_HOSTNAME, closeDb, getDb } from "./config/postgresClient";
import * as schema from "./config/schema";
import { reset } from "drizzle-seed";

if (process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME)) {
  console.error("Cannot wipe production database!");
  process.exit(1);
}

async function wipe() {
  console.log("Wiping database...");
  const db = getDb();
  await reset(db, schema);
  console.log("Database wiped!");
  await closeDb();
}

wipe().catch(err => {
  console.error("Wipe failed:", err);
  process.exit(1);
});
