import { Faucet } from "~~/components/scaffold-eth";
import WagmiCustomConnectButton from "~~/components/scaffold-eth/WagmiCustomConnectButton";

/**
 * Site header
 */
export default function Header() {
  return (
    <div className="mt-5 flex justify-center items-center">
      <WagmiCustomConnectButton />
      <Faucet />
    </div>
  );
}
