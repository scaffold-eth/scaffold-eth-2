import { users } from "../config/schema";
import type { InferInsertModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";

export type User = InferInsertModel<typeof users>;

export async function getAllUsers() {
  return await db.query.users.findMany();
}

export async function getUserById(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function createUser(user: User) {
  return await db.insert(users).values(user);
}
