"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useAuthSession } from "~~/hooks/useAuthSession";

export const SignInNextAuthButton = () => {
  const { isAuthenticated } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.refresh();
    }
  }, [router, isAuthenticated]);

  return (
    <button className="btn btn-outline text-lg font-normal" onClick={() => signIn()} type="button">
      Sign in with Next Auth
    </button>
  );
};
