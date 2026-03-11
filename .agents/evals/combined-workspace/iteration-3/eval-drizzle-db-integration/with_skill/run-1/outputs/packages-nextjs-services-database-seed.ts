import { closeDb, getDb, PRODUCTION_DATABASE_HOSTNAME } from "./config/postgresClient";
import * as schema from "./config/schema";
import "dotenv/config";

async function main() {
  if (process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME)) {
    console.error("Cannot seed production database. Aborting.");
    process.exit(1);
  }

  const db = getDb();

  console.log("Seeding database...");

  await db.insert(schema.users).values([
    { name: "Alice", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" },
    { name: "Bob", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
    { name: "Charlie", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
  ]);

  console.log("Seeding complete.");
  await closeDb();
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
