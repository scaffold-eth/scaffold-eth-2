"use client";

import { useState } from "react";
import { createWalletClient, http, parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "1";
const FAUCET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const localWalletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});

/**
 * FaucetButton button which lets you grab eth.
 */
export const FaucetButton = () => {
  const { address, chain: ConnectedChain } = useAccount();

  const { data: balance } = useWatchBalance({ address });

  const [loading, setLoading] = useState(false);

  const faucetTxn = useTransactor(localWalletClient);

  const sendETH = async () => {
    if (!address) return;
    try {
      setLoading(true);
      await faucetTxn({
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
  if (ConnectedChain?.id !== hardhat.id) {
    return null;
  }

  const isBalanceZero = balance && balance.value === 0n;

  return (
    <div
      className={
        !isBalanceZero
          ? "ml-1"
          : "ml-1 tooltip tooltip-bottom tooltip-primary tooltip-open font-bold before:left-auto before:transform-none before:content-[attr(data-tip)] before:-translate-x-2/5"
      }
      data-tip="Grab funds from faucet"
    >
      <button className="btn btn-secondary btn-sm px-2 rounded-full" onClick={sendETH} disabled={loading}>
        {!loading ? (
          <BanknotesIcon className="h-4 w-4" />
        ) : (
          <span className="loading loading-spinner loading-xs"></span>
        )}
      </button>
    </div>
  );
};
