import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "./api";
import type { NewUser, User } from "~~/server/db/schema";

const USERS_QUERY_KEY = ["users"];

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: USERS_QUERY_KEY,
    queryFn: userApi.getAll,
  });
};

export const useUser = (id: number) => {
  return useQuery<User>({
    queryKey: [...USERS_QUERY_KEY, id],
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<NewUser, "id" | "createdAt" | "updatedAt">) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Pick<User, "username" | "email" | "bio">> }) =>
      userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};
