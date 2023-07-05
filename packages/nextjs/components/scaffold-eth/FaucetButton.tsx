import { useState } from "react";
import { createWalletClient, http, parseEther } from "viem";
import { useAccount, useNetwork } from "wagmi";
import { hardhat } from "wagmi/chains";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useAccountBalance, useTransactor } from "~~/hooks/scaffold-eth";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "1";
const FAUCET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

/**
 * FaucetButton button which lets you grab eth.
 */
export const FaucetButton = () => {
  const { address } = useAccount();
  const { balance } = useAccountBalance(address);
  const { chain: ConnectedChain } = useNetwork();
  const [loading, setLoading] = useState(false);
  const localWalletClient = createWalletClient({
    chain: hardhat,
    transport: http(),
  });
  const faucetTxn = useTransactor(localWalletClient);

  const sendETH = async () => {
    try {
      setLoading(true);
      await faucetTxn({
        chain: hardhat,
        account: FAUCET_ADDRESS,
        to: address,
        value: parseEther(NUM_OF_ETH),
      });
      setLoading(false);
    } catch (error) {
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
      setLoading(false);
    }
  };

  // Render only on local chain
  if (!ConnectedChain || ConnectedChain.id !== hardhat.id) {
    return null;
  }

  return (
    <div
      className={
        balance
          ? ""
          : "tooltip tooltip-bottom tooltip-open tooltip-secondary font-bold before:left-auto before:right-0 before:transform-none before:content-[attr(data-tip)]"
      }
      data-tip="Grab funds from faucet"
    >
      <button
        className={`btn btn-secondary btn-sm rounded-full px-2 ${
          loading ? "loading before:!mx-0 before:!h-4 before:!w-4" : ""
        }`}
        onClick={sendETH}
        disabled={loading}
      >
        {!loading && <BanknotesIcon className="h-4 w-4" />}
      </button>
    </div>
  );
};
