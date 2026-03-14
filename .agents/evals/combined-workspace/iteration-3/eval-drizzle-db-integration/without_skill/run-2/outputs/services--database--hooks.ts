import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, deleteUser, fetchUserByAddress, fetchUsers, updateUser } from "./api";
import { CreateUserPayload, UpdateUserPayload } from "./types";

const USERS_QUERY_KEY = ["users"] as const;

/**
 * Fetch all users from the database.
 */
export function useUsers() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: fetchUsers,
  });
}

/**
 * Fetch a single user by their Ethereum address.
 */
export function useUser(address: string | undefined) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, address],
    queryFn: () => fetchUserByAddress(address!),
    enabled: !!address,
  });
}

/**
 * Create a new user record.
 * Automatically invalidates the users query cache on success.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

/**
 * Update an existing user record by address.
 * Automatically invalidates the users query cache on success.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ address, data }: { address: string; data: UpdateUserPayload }) => updateUser(address, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

/**
 * Delete a user record by address.
 * Automatically invalidates the users query cache on success.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (address: string) => deleteUser(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}
