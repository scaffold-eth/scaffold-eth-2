import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./schema";

// Seed script to populate the database with sample data.
// Usage: npx tsx server/db/seed.ts

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  console.log("Seeding database...");

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  const sampleUsers = [
    {
      address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      username: "alice",
      email: "alice@example.com",
      bio: "Ethereum developer and DeFi enthusiast",
      points: 100,
    },
    {
      address: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      username: "bob",
      email: "bob@example.com",
      bio: "Smart contract auditor",
      points: 250,
    },
    {
      address: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
      username: "charlie",
      email: "charlie@example.com",
      bio: "NFT artist and collector",
      points: 50,
    },
  ];

  for (const user of sampleUsers) {
    await db.insert(users).values(user).onConflictDoNothing();
  }

  console.log("Seeding completed! Inserted sample users.");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
