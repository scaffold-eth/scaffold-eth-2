import { getServerSession } from "next-auth";
import {
  SessionDisplay,
  SignInNextAuthButton,
  SignInWithBurnerWallet,
  SignInWithEthereumButton,
  SignInWithSolanaButton,
  SignOutButton,
} from "~~/components/cosmic-engine";
import { authOptions } from "~~/utils/auth";

export const NextAuthLoginCard = async () => {
  const session = await getServerSession(authOptions);

  return (
    <>
      <p className="my-2 font-medium">Next Auth Login Card</p>
      {!session ? (
        <div className="flex flex-col">
          <div className="py-3">
            <SignInWithBurnerWallet />
          </div>

          <div className="py-3">
            <SignInWithEthereumButton />
          </div>
          <div className="py-3">
            <SignInWithSolanaButton />
          </div>
          <div className="py-3">
            <SignInNextAuthButton />
          </div>
        </div>
      ) : (
        <div>
          <SignOutButton />
          <div className="py-5">
            <SessionDisplay session={session} />
          </div>
        </div>
      )}
    </>
  );
};
