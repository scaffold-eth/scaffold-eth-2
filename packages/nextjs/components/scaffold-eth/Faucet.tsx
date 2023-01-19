import { ethers } from "ethers";
import React, { useState } from "react";
import { chain, useAccount, useNetwork } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getLocalProvider } from "~~/utils/scaffold-eth";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useAccountBalance } from "~~/hooks/scaffold-eth/useAccountBalance";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "1";

/**
 * Faucet button which lets you grab eth.
 */
export default function Faucet() {
  const { address } = useAccount();
  const { balance } = useAccountBalance(address);
  const { chain: ConnectedChain } = useNetwork();
  const [loading, setLoading] = useState(false);
  const provider = getLocalProvider(chain.localhost);
  const signer = provider?.getSigner();
  const faucetTxn = useTransactor(signer);

  const sendETH = async () => {
    try {
      setLoading(true);
      if (faucetTxn) {
        await faucetTxn({ to: address, value: ethers.utils.parseEther(NUM_OF_ETH) });
      }
      setLoading(false);
    } catch (error) {
      console.error("⚡️ ~ file: Faucet.tsx ~ line 26 ~ sendETH ~ error", error);
      setLoading(false);
    }
  };

  // Render only on local chain
  if (!ConnectedChain || ConnectedChain.id !== chain.hardhat.id) {
    return null;
  }

  return (
    <div
      className={
        balance
          ? ""
          : "tooltip tooltip-bottom tooltip-secondary tooltip-open font-bold before:left-auto before:transform-none before:content-[attr(data-tip)] before:right-0"
      }
      data-tip="Grab funds from faucet"
    >
      <button
        className={`btn btn-secondary btn-sm px-2 rounded-full ${
          loading ? "loading before:!w-4 before:!h-4 before:!mx-0" : ""
        }`}
        onClick={sendETH}
        disabled={loading}
      >
        {!loading && <BanknotesIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}
