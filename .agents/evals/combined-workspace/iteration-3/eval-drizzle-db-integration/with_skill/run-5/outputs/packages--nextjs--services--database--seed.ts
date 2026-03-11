import * as dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

import { PRODUCTION_DATABASE_HOSTNAME, closeDb } from "./config/postgresClient";
import { users } from "./config/schema";
import { createUser } from "./repositories/users";

if (process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME)) {
  console.error("Cannot seed production database!");
  process.exit(1);
}

async function seed() {
  console.log("Seeding database...");

  await createUser({ name: "Alice", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" });
  await createUser({ name: "Bob", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" });
  await createUser({ name: "Charlie", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" });

  console.log("Seeding complete!");
  await closeDb();
}

seed().catch(e => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
