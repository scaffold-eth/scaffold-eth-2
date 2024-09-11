"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { getCsrfToken, signIn } from "next-auth/react";
import { useAuthSession } from "~~/hooks/useAuthSession";
import { SigninMessage } from "~~/utils/SigninMessage";

export const SignInWithSolanaButton = () => {
  const { isAuthenticated } = useAuthSession();
  const router = useRouter();
  const wallet = useWallet();
  const walletModal = useWalletModal();

  useEffect(() => {
    if (isAuthenticated) {
      router.refresh();
    }
  }, [router, isAuthenticated]);

  const handleSignIn = async () => {
    try {
      if (!wallet.connected) {
        walletModal.setVisible(true);
      }

      const csrf = await getCsrfToken();
      if (!wallet.publicKey || !csrf || !wallet.signMessage) return;

      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: wallet.publicKey?.toBase58(),
        statement: `Sign this message to sign in to the app.`,
        nonce: csrf,
      });

      const data = new TextEncoder().encode(message.prepare());
      const signature = await wallet.signMessage(data);
      const serializedSignature = bs58.encode(signature);

      signIn("solana", {
        message: JSON.stringify(message),
        redirect: false,
        signature: serializedSignature,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button className="btn btn-outline text-lg font-normal" onClick={handleSignIn} type="button">
      Sign in with Solana
    </button>
  );
};
