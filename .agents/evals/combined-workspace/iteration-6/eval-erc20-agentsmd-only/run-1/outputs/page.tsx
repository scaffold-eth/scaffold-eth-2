"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Address, AddressInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
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

  // Write contract hooks
  const { writeContractAsync: writeGoldTokenAsync, isPending: isMinting } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const { writeContractAsync: writeGoldTokenTransferAsync, isPending: isTransferring } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const formatTokenAmount = (amount: bigint | undefined) => {
    if (amount === undefined) return "0";
    return parseFloat(formatUnits(amount, 18)).toLocaleString(undefined, {
      maximumFractionDigits: 4,
    });
  };

  const handleMint = async () => {
    if (!mintTo || !mintAmount) {
      notification.error("Please fill in all mint fields");
      return;
    }
    try {
      await writeGoldTokenAsync({
        functionName: "mint",
        args: [mintTo, parseUnits(mintAmount, 18)],
      });
      notification.success(`Successfully minted ${mintAmount} GOLD`);
      setMintAmount("");
    } catch (e) {
      console.error("Minting failed:", e);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      notification.error("Please fill in all transfer fields");
      return;
    }
    try {
      await writeGoldTokenTransferAsync({
        functionName: "transfer",
        args: [transferTo, parseUnits(transferAmount, 18)],
      });
      notification.success(`Successfully transferred ${transferAmount} GOLD`);
      setTransferAmount("");
    } catch (e) {
      console.error("Transfer failed:", e);
    }
  };

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === owner.toLowerCase();

  return (
    <div className="flex items-center flex-col grow pt-10 px-4">
      <h1 className="text-center">
        <span className="block text-4xl font-bold mb-2">
          {tokenName || "GoldToken"} ({tokenSymbol || "GOLD"})
        </span>
      </h1>

      {/* Token Info */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Supply</div>
            <div className="stat-value text-lg">{formatTokenAmount(totalSupply)} GOLD</div>
          </div>
          <div className="stat">
            <div className="stat-title">Max Supply (Cap)</div>
            <div className="stat-value text-lg">{formatTokenAmount(cap)} GOLD</div>
          </div>
          <div className="stat">
            <div className="stat-title">Your Balance</div>
            <div className="stat-value text-lg">{formatTokenAmount(connectedBalance)} GOLD</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-medium">Owner:</span>
          <Address address={owner} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center">
        {/* Mint Section - only visible to owner */}
        {isOwner && (
          <div className="card bg-base-100 shadow-xl flex-1">
            <div className="card-body">
              <h2 className="card-title">Mint Tokens</h2>
              <p className="text-sm opacity-70">Mint new GOLD tokens to any address (owner only)</p>
              <div className="form-control gap-4 mt-4">
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
                    placeholder="Amount to mint"
                    className="input input-bordered w-full"
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
        <div className="card bg-base-100 shadow-xl flex-1">
          <div className="card-body">
            <h2 className="card-title">Transfer Tokens</h2>
            <p className="text-sm opacity-70">Send GOLD tokens to another address</p>
            <div className="form-control gap-4 mt-4">
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
                  placeholder="Amount to transfer"
                  className="input input-bordered w-full"
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
