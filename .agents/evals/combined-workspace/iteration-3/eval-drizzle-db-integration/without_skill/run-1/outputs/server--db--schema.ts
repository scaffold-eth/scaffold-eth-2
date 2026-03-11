import { boolean, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Users table — stores off-chain user profile data linked to wallet addresses.
 * The `address` column holds the Ethereum address (0x-prefixed, 42 chars).
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 42 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  bio: text("bio"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
