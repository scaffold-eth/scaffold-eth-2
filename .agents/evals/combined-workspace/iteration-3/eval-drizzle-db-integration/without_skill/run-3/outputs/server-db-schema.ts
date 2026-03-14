import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Users table - stores off-chain user data linked to wallet addresses
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 42 }).notNull().unique(),
  username: varchar("username", { length: 255 }),
  email: varchar("email", { length: 255 }),
  bio: text("bio"),
  points: integer("points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports for use in API routes and client code
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
