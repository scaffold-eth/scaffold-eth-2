import { users } from "../config/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export async function getAllUsers() {
  return await db.query.users.findMany();
}

export async function getUserById(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function getUserByAddress(address: string) {
  return await db.query.users.findFirst({
    where: eq(users.address, address),
  });
}

export async function createUser(user: NewUser) {
  return await db.insert(users).values(user).returning();
}

export async function deleteUser(id: string) {
  return await db.delete(users).where(eq(users.id, id)).returning();
}
