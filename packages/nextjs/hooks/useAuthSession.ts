import { User } from "next-auth";
import { UseSessionOptions, useSession } from "next-auth/react";

export const useAuthSession = <R extends boolean>(options?: UseSessionOptions<R>) => {
  interface ExtendedUser extends User {
    role?: string;
    address?: string;
  }

  const sessionData = useSession(options);
  const user = sessionData?.data?.user as ExtendedUser;

  const isAdmin = user?.role === "admin";
  const address = user?.address;

  const isAuthenticated = sessionData.status === "authenticated";

  return { ...sessionData, isAdmin, address, isAuthenticated };
};
