import type { User } from "~~/server/db/schema";

const API_BASE = "/api/users";

type CreateUserInput = {
  address: string;
  username?: string;
  email?: string;
  bio?: string;
  points?: number;
};

type UpdateUserInput = {
  username?: string;
  email?: string;
  bio?: string;
  points?: number;
};

// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
};

// Fetch a single user by ID
export const fetchUserById = async (id: number): Promise<User> => {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
};

// Fetch a user by wallet address
export const fetchUserByAddress = async (address: string): Promise<User | null> => {
  const response = await fetch(`${API_BASE}?address=${address}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
};

// Create a new user
export const createUser = async (data: CreateUserInput): Promise<User> => {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create user");
  }
  return response.json();
};

// Update a user by ID
export const updateUser = async (id: number, data: UpdateUserInput): Promise<User> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }
  return response.json();
};

// Delete a user by ID
export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete user");
  }
};
