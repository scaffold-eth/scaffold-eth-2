"use client";

import { useState } from "react";
import { Address, AddressInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const GoldTokenPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

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

  const { data: ownerAddress } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "owner",
  });

  const { data: connectedBalance } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Write contract hooks
  const { writeContractAsync: writeGoldToken, isPending: isMintPending } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const { writeContractAsync: writeGoldTokenTransfer, isPending: isTransferPending } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const handleMint = async () => {
    if (!mintTo || !mintAmount) {
      notification.error("Please fill in both address and amount");
      return;
    }
    try {
      await writeGoldToken({
        functionName: "mint",
        args: [mintTo, parseUnits(mintAmount, 18)],
      });
      notification.success(`Minted ${mintAmount} GOLD tokens`);
      setMintAmount("");
    } catch (e) {
      console.error("Mint error:", e);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      notification.error("Please fill in both address and amount");
      return;
    }
    try {
      await writeGoldTokenTransfer({
        functionName: "transfer",
        args: [transferTo, parseUnits(transferAmount, 18)],
      });
      notification.success(`Transferred ${transferAmount} GOLD tokens`);
      setTransferAmount("");
    } catch (e) {
      console.error("Transfer error:", e);
    }
  };

  const formatTokenAmount = (amount: bigint | undefined) => {
    if (amount === undefined) return "...";
    return formatUnits(amount, 18);
  };

  const isOwner = connectedAddress && ownerAddress && connectedAddress.toLowerCase() === ownerAddress.toLowerCase();

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-3xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold mb-2">
            {tokenName ?? "GoldToken"} ({tokenSymbol ?? "GOLD"})
          </span>
          <span className="block text-lg">ERC-20 Token with Capped Supply</span>
        </h1>

        {/* Token Info */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-70">Total Supply</p>
                <p className="text-lg font-semibold">{formatTokenAmount(totalSupply)} GOLD</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Max Supply (Cap)</p>
                <p className="text-lg font-semibold">{formatTokenAmount(cap)} GOLD</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Owner</p>
                {ownerAddress ? <Address address={ownerAddress} /> : <span>...</span>}
              </div>
              <div>
                <p className="text-sm opacity-70">Your Balance</p>
                <p className="text-lg font-semibold">{formatTokenAmount(connectedBalance)} GOLD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mint Section (owner only) */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Mint Tokens {!isOwner && <span className="badge badge-warning">Owner Only</span>}</h2>
            <div className="flex flex-col gap-4">
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
                  placeholder="e.g. 1000"
                  className="input input-bordered w-full"
                  value={mintAmount}
                  onChange={e => setMintAmount(e.target.value)}
                  min="0"
                  step="any"
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleMint}
                disabled={isMintPending || !isOwner}
              >
                {isMintPending ? <span className="loading loading-spinner"></span> : "Mint Tokens"}
              </button>
              {!isOwner && connectedAddress && (
                <p className="text-sm text-warning">Only the contract owner can mint tokens.</p>
              )}
            </div>
          </div>
        </div>

        {/* Transfer Section */}
        <div className="card bg-base-100 shadow-xl mt-6 mb-10">
          <div className="card-body">
            <h2 className="card-title">Transfer Tokens</h2>
            <div className="flex flex-col gap-4">
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
                  placeholder="e.g. 100"
                  className="input input-bordered w-full"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  min="0"
                  step="any"
                />
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleTransfer}
                disabled={isTransferPending}
              >
                {isTransferPending ? <span className="loading loading-spinner"></span> : "Transfer Tokens"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldTokenPage;
