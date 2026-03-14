import type { NewUser, User } from "~~/server/db/schema";

const API_BASE = "/api/users";

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  getById: async (id: number): Promise<User> => {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  },

  create: async (data: Omit<NewUser, "id" | "createdAt" | "updatedAt">): Promise<User> => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create user");
    }
    return res.json();
  },

  update: async (id: number, data: Partial<Pick<User, "username" | "email" | "bio">>): Promise<User> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update user");
    }
    return res.json();
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete user");
  },
};
