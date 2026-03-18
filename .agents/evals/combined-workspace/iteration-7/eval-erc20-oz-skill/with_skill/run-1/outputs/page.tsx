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
  const { writeContractAsync: writeGoldToken, isPending: isMinting } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const { writeContractAsync: writeGoldTokenTransfer, isPending: isTransferring } = useScaffoldWriteContract({
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
      notification.success(`Minted ${mintAmount} GOLD tokens!`);
      setMintAmount("");
    } catch (e) {
      console.error("Minting error:", e);
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
      notification.success(`Transferred ${transferAmount} GOLD tokens!`);
      setTransferAmount("");
    } catch (e) {
      console.error("Transfer error:", e);
    }
  };

  const formatTokenAmount = (amount: bigint | undefined) => {
    if (amount === undefined) return "0";
    return formatUnits(amount, 18);
  };

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === owner.toLowerCase();

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">
            {tokenName || "GoldToken"} ({tokenSymbol || "GOLD"})
          </span>
        </h1>

        {/* Token Info Card */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-70">Total Supply</p>
                <p className="font-bold">{formatTokenAmount(totalSupply)} GOLD</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Max Supply (Cap)</p>
                <p className="font-bold">{formatTokenAmount(cap)} GOLD</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Your Balance</p>
                <p className="font-bold">{formatTokenAmount(connectedBalance)} GOLD</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Owner</p>
                <Address address={owner} />
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
              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text">Recipient Address</span>
                </label>
                <AddressInput value={mintTo} onChange={setMintTo} placeholder="0x..." />
              </div>
              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text">Amount (GOLD)</span>
                </label>
                <input
                  type="number"
                  placeholder="0.0"
                  className="input input-bordered w-full"
                  value={mintAmount}
                  onChange={e => setMintAmount(e.target.value)}
                />
              </div>
              <div className="card-actions mt-4">
                <button className="btn btn-primary w-full" onClick={handleMint} disabled={isMinting}>
                  {isMinting ? <span className="loading loading-spinner"></span> : "Mint GOLD"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Section */}
        <div className="card bg-base-100 shadow-xl mt-6 mb-10">
          <div className="card-body">
            <h2 className="card-title">Transfer Tokens</h2>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Recipient Address</span>
              </label>
              <AddressInput value={transferTo} onChange={setTransferTo} placeholder="0x..." />
            </div>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Amount (GOLD)</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                className="input input-bordered w-full"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
              />
            </div>
            <div className="card-actions mt-4">
              <button className="btn btn-secondary w-full" onClick={handleTransfer} disabled={isTransferring}>
                {isTransferring ? <span className="loading loading-spinner"></span> : "Transfer GOLD"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldTokenPage;
