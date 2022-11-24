import { Faucet } from "~~/components/scaffold-eth";
import RainbowKitCustomConnectButton from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";

/**
 * Site header
 */
export default function Header() {
  return (
    <div className="mt-5 flex justify-center items-center">
      <RainbowKitCustomConnectButton />
      <Faucet />
    </div>
  );
}
