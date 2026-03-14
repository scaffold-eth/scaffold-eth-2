import type { User } from "~~/server/db/schema";

const API_BASE = "/api/users";

type UserPayload = {
  address: string;
  name?: string;
  email?: string;
  bio?: string;
};

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
}

export async function fetchUserByAddress(address: string): Promise<User> {
  const response = await fetch(`${API_BASE}/${address}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("User not found");
    }
    throw new Error("Failed to fetch user");
  }
  return response.json();
}

export async function createOrUpdateUser(data: UserPayload): Promise<User> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create/update user");
  }
  return response.json();
}

export async function updateUser(address: string, data: Partial<Omit<UserPayload, "address">>): Promise<User> {
  const response = await fetch(`${API_BASE}/${address}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }
  return response.json();
}

export async function deleteUser(address: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${address}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete user");
  }
}
