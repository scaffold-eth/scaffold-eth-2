"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useAuthSession } from "~~/hooks/useAuthSession";

// set to null to allow users to choose their own provider
const DEFAULT_PROVIDER = "github";

export const SignInNextAuthButton = () => {
  const { isAuthenticated } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.refresh();
    }
  }, [router, isAuthenticated]);

  const capitalize = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <button className="btn btn-outline text-lg font-normal" onClick={() => signIn(DEFAULT_PROVIDER)} type="button">
      Sign in with {DEFAULT_PROVIDER ? capitalize(DEFAULT_PROVIDER) : "Next Auth"}
    </button>
  );
};
