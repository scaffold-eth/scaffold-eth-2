import * as schema from "./config/schema";
import { closeDb, getDb, PRODUCTION_DATABASE_HOSTNAME } from "./config/postgresClient";
import * as dotenv from "dotenv";
import { reset } from "drizzle-seed";

dotenv.config({ path: ".env.development" });

async function main() {
  if (process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME)) {
    console.error("Cannot wipe production database. Aborting.");
    process.exit(1);
  }

  const db = getDb();

  await reset(db as Parameters<typeof reset>[0], schema);
  console.log("Database wiped successfully.");
  await closeDb();
}

main().catch(err => {
  console.error("Wipe failed:", err);
  process.exit(1);
});
