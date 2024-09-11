import { getServerSession } from "next-auth";
import {
  SessionDisplay,
  SignInNextAuthButton,
  SignInWithEthereumButton,
  SignOutButton,
} from "~~/components/cosmic-engine";
import { authOptions } from "~~/utils/auth";

export const NextAuthProfileCard = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-s rounded-3xl">
      <p className="my-2 font-medium">Next Auth Profile Card</p>
      {!session ? (
        <div className="flex flex-col">
          <div className="py-3">
            <SignInNextAuthButton />
          </div>
          <div className="py-3">
            <SignInWithEthereumButton />
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
    </div>
  );
};
