import type { User } from "~~/services/database/repositories/users";

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  return res.json();
}

export async function createUserAPIRequest(user: User) {
  return await fetch("/api/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}
