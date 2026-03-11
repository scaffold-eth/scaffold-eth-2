import type { User } from "~~/services/database/repositories/users";

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  return res.json();
}

export async function createUserAPIRequest(user: { name: string; address?: string }) {
  return await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}
