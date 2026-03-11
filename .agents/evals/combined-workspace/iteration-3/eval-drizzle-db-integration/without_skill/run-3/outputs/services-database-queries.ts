import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, deleteUser, fetchUserByAddress, fetchUsers, updateUser } from "./api";

// Query key factory for cache management
const userKeys = {
  all: ["users"] as const,
  byAddress: (address: string) => ["users", "address", address] as const,
};

// Hook to fetch all users
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: fetchUsers,
  });
};

// Hook to fetch a user by wallet address
export const useUserByAddress = (address: string | undefined) => {
  return useQuery({
    queryKey: userKeys.byAddress(address || ""),
    queryFn: () => fetchUserByAddress(address!),
    enabled: !!address,
  });
};

// Hook to create a new user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Hook to update a user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateUser>[1] }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Hook to delete a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
