import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Seed the database with sample user data.
 * Usage: npx tsx db/seed.ts
 */
async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log("Seeding database...");

  const sampleUsers: schema.NewUser[] = [
    {
      address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      name: "Vitalik Buterin",
      email: "vitalik@ethereum.org",
      bio: "Co-founder of Ethereum",
      points: 1000,
    },
    {
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
      name: "Alice Builder",
      email: "alice@builder.eth",
      bio: "Full-stack dApp developer",
      points: 500,
    },
    {
      address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      name: "Bob Developer",
      bio: "Smart contract enthusiast",
      points: 250,
    },
  ];

  for (const user of sampleUsers) {
    await db
      .insert(schema.users)
      .values(user)
      .onConflictDoUpdate({
        target: schema.users.address,
        set: {
          name: user.name,
          email: user.email,
          bio: user.bio,
          points: user.points,
          updatedAt: new Date(),
        },
      });
    console.log(`  Upserted user: ${user.name} (${user.address})`);
  }

  console.log("Seeding completed successfully.");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
