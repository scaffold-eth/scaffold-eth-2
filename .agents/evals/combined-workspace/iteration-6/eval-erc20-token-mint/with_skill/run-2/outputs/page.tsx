"use client";

import { useState } from "react";
import { Address, AddressInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth";

const GoldTokenPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [mintTo, setMintTo] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // Read contract data
  const { data: tokenName } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "name",
  });

  const { data: tokenSymbol } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "symbol",
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "totalSupply",
  });

  const { data: cap } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "cap",
  });

  const { data: connectedBalance } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "owner",
  });

  // Write contract functions
  const { writeContractAsync: writeMint, isPending: isMinting } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const { writeContractAsync: writeTransfer, isPending: isTransferring } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const formatTokenAmount = (amount: bigint | undefined) => {
    if (amount === undefined) return "0";
    return formatUnits(amount, 18);
  };

  const handleMint = async () => {
    if (!mintTo || !mintAmount) {
      notification.error("Please fill in all fields");
      return;
    }
    try {
      const parsedAmount = parseUnits(mintAmount, 18);
      await writeMint({
        functionName: "mint",
        args: [mintTo, parsedAmount],
      });
      notification.success(`Minted ${mintAmount} GOLD tokens`);
      setMintAmount("");
    } catch (e) {
      const errorMessage = getParsedError(e);
      notification.error(errorMessage);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      notification.error("Please fill in all fields");
      return;
    }
    try {
      const parsedAmount = parseUnits(transferAmount, 18);
      await writeTransfer({
        functionName: "transfer",
        args: [transferTo, parsedAmount],
      });
      notification.success(`Transferred ${transferAmount} GOLD tokens`);
      setTransferAmount("");
    } catch (e) {
      const errorMessage = getParsedError(e);
      notification.error(errorMessage);
    }
  };

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === owner.toLowerCase();

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">
            {tokenName ?? "GoldToken"} ({tokenSymbol ?? "GOLD"})
          </span>
        </h1>

        {/* Token Info */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-medium">Total Supply:</span>
                <span>{formatTokenAmount(totalSupply)} GOLD</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Max Supply (Cap):</span>
                <span>{formatTokenAmount(cap)} GOLD</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Your Balance:</span>
                <span>{formatTokenAmount(connectedBalance)} GOLD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Owner:</span>
                <Address
                  address={owner}
                  chain={targetNetwork}
                  blockExplorerAddressLink={
                    targetNetwork.id === hardhat.id ? `/blockexplorer/address/${owner}` : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mint Section - Only visible to owner */}
        {isOwner && (
          <div className="card bg-base-100 shadow-xl mt-6">
            <div className="card-body">
              <h2 className="card-title">Mint Tokens</h2>
              <p className="text-sm opacity-70">Only the contract owner can mint new tokens.</p>
              <div className="flex flex-col gap-4 mt-2">
                <div>
                  <label className="label">
                    <span className="label-text">Recipient Address</span>
                  </label>
                  <AddressInput value={mintTo} onChange={setMintTo} placeholder="0x..." />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Amount (GOLD)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="100"
                    value={mintAmount}
                    onChange={e => setMintAmount(e.target.value)}
                    min="0"
                    step="any"
                  />
                </div>
                <button className="btn btn-primary" onClick={handleMint} disabled={isMinting}>
                  {isMinting ? <span className="loading loading-spinner loading-sm"></span> : "Mint"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Section */}
        <div className="card bg-base-100 shadow-xl mt-6 mb-10">
          <div className="card-body">
            <h2 className="card-title">Transfer Tokens</h2>
            <div className="flex flex-col gap-4 mt-2">
              <div>
                <label className="label">
                  <span className="label-text">Recipient Address</span>
                </label>
                <AddressInput value={transferTo} onChange={setTransferTo} placeholder="0x..." />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Amount (GOLD)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="100"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  min="0"
                  step="any"
                />
              </div>
              <button className="btn btn-secondary" onClick={handleTransfer} disabled={isTransferring}>
                {isTransferring ? <span className="loading loading-spinner loading-sm"></span> : "Transfer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldTokenPage;
