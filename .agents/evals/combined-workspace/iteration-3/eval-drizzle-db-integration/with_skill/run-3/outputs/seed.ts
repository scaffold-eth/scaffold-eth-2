import * as dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

import { PRODUCTION_DATABASE_HOSTNAME, closeDb } from "./config/postgresClient";
import { createUser } from "./repositories/users";

if (process.env.POSTGRES_URL?.includes(PRODUCTION_DATABASE_HOSTNAME)) {
  console.error("Cannot seed production database!");
  process.exit(1);
}

async function seed() {
  console.log("Seeding database...");

  const testUsers = [
    { name: "Alice", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
    { name: "Bob", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
    { name: "Charlie", address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906" },
  ];

  for (const user of testUsers) {
    await createUser(user);
    console.log(`  Created user: ${user.name}`);
  }

  console.log("Seeding complete!");
  await closeDb();
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
