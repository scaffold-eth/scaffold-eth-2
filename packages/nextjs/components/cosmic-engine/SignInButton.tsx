"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAuthSession } from "~~/hooks/useAuthSession";

export const SignInButton = () => {
  const { openConnectModal } = useConnectModal();
  const { isAuthenticated } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.refresh();
    }
  }, [router, isAuthenticated]);

  return (
    <button className="btn btn-outline text-lg font-normal" onClick={openConnectModal} type="button">
      Sign in with Ethereum
    </button>
  );
};
