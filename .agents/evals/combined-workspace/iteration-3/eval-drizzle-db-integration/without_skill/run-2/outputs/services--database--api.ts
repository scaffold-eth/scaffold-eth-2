import { CreateUserPayload, UpdateUserPayload, UserRecord } from "./types";

const API_BASE = "/api/users";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchUsers(): Promise<UserRecord[]> {
  const response = await fetch(API_BASE);
  return handleResponse<UserRecord[]>(response);
}

export async function fetchUserByAddress(address: string): Promise<UserRecord> {
  const response = await fetch(`${API_BASE}/${address}`);
  return handleResponse<UserRecord>(response);
}

export async function createUser(data: CreateUserPayload): Promise<UserRecord> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<UserRecord>(response);
}

export async function updateUser(address: string, data: UpdateUserPayload): Promise<UserRecord> {
  const response = await fetch(`${API_BASE}/${address}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<UserRecord>(response);
}

export async function deleteUser(address: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/${address}`, {
    method: "DELETE",
  });
  return handleResponse<{ message: string }>(response);
}
