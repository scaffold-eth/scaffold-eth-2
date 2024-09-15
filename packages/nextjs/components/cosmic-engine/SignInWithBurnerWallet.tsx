"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "~~/hooks/useAuthSession";

// import { useBurnerWallet } from "~~/hooks/scaffold-eth";

export const SignInWithBurnerWallet = () => {
  const { isAuthenticated } = useAuthSession();
  const router = useRouter();
  // const burnerWallet = useBurnerWallet();

  const signIn = async () => {
    // const newWallet = burnerWallet.generateNewBurner();
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.refresh();
    }
  }, [router, isAuthenticated]);

  return (
    <button className="btn btn-outline text-lg font-normal" onClick={signIn} type="button">
      Sign In As Guest
    </button>
  );
};
