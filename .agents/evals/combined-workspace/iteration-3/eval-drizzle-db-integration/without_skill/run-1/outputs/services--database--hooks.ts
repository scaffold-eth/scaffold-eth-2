import { createOrUpdateUser, deleteUser, fetchUserByAddress, fetchUsers, updateUser } from "./api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const USERS_KEY = ["users"] as const;

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: fetchUsers,
  });
}

export function useUserByAddress(address: string | undefined) {
  return useQuery({
    queryKey: [...USERS_KEY, address],
    queryFn: () => fetchUserByAddress(address!),
    enabled: !!address,
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (error.message === "User not found") return false;
      return failureCount < 3;
    },
  });
}

export function useCreateOrUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrUpdateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ address, data }: { address: string; data: { name?: string; email?: string; bio?: string } }) =>
      updateUser(address, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}
