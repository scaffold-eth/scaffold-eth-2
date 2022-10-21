import { ethers } from "ethers";
import React, { useState } from "react";
import { chain, useAccount, useNetwork } from "wagmi";
import { getLocalProvider } from "~~/utils/scaffold-eth";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "1";

/**
  Faucet button which lets you grab eth.
**/

type FaucetProps = {
  refresh?: boolean;
  setRefresh: (arg: boolean) => void;
};

export default function Faucet({ refresh, setRefresh }: FaucetProps) {
  const { address } = useAccount();
  const { chain: ConnectedChain } = useNetwork();
  const [loading, setLoading] = useState(false);

  const sendETH = async () => {
    try {
      setLoading(true);
      const provider = getLocalProvider(chain.localhost);
      const signer = provider?.getSigner();
      await signer?.sendTransaction({ to: address, value: ethers.utils.parseEther(NUM_OF_ETH) });
      setLoading(false);
      setRefresh(!refresh);
    } catch (error) {
      console.error("⚡️ ~ file: Faucet.tsx ~ line 26 ~ sendETH ~ error", error);
      setLoading(false);
    }
  };

  // Render only on local chain
  if (ConnectedChain?.id !== chain.hardhat.id) {
    return null;
  }

  return (
    <button className={`btn btn-warning ${loading && "loading"} text-gray-700`} onClick={sendETH} disabled={loading}>
      💰 Get funds from faucet
    </button>
  );
}
