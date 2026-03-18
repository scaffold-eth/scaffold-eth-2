"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Address, AddressInput } from "@scaffold-ui/components";
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

  const { data: ownerAddress } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "owner",
  });

  // Write contract hooks
  const { writeContractAsync: writeGoldTokenAsync, isPending: isMinting } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const { writeContractAsync: writeTransferAsync, isPending: isTransferring } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const formatTokenAmount = (amount: bigint | undefined) => {
    if (amount === undefined) return "0";
    return Number(formatUnits(amount, 18)).toLocaleString(undefined, {
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
      console.error("Mint error:", e);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      notification.error("Please fill in all transfer fields");
      return;
    }
    try {
      await writeTransferAsync({
        functionName: "transfer",
        args: [transferTo, parseUnits(transferAmount, 18)],
      });
      notification.success(`Successfully transferred ${transferAmount} GOLD`);
      setTransferAmount("");
    } catch (e) {
      console.error("Transfer error:", e);
    }
  };

  const isOwner = connectedAddress && ownerAddress && connectedAddress.toLowerCase() === ownerAddress.toLowerCase();

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold mb-2">
            {tokenName || "GoldToken"} ({tokenSymbol || "GOLD"})
          </span>
          <span className="block text-lg text-base-content/70">ERC-20 Token with Capped Supply</span>
        </h1>

        {/* Token Info Cards */}
        <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center">
          <div className="card bg-base-100 shadow-xl flex-1">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-sm opacity-70">Total Supply</h2>
              <p className="text-2xl font-bold">{formatTokenAmount(totalSupply)}</p>
              <p className="text-sm opacity-50">{tokenSymbol || "GOLD"}</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl flex-1">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-sm opacity-70">Max Supply (Cap)</h2>
              <p className="text-2xl font-bold">{formatTokenAmount(cap)}</p>
              <p className="text-sm opacity-50">{tokenSymbol || "GOLD"}</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl flex-1">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-sm opacity-70">Your Balance</h2>
              <p className="text-2xl font-bold">{formatTokenAmount(connectedBalance)}</p>
              <p className="text-sm opacity-50">{tokenSymbol || "GOLD"}</p>
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="opacity-70">Contract Owner:</span>
            <Address address={ownerAddress} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mt-10">
          {/* Mint Section - only visible to owner */}
          <div className="card bg-base-100 shadow-xl flex-1">
            <div className="card-body">
              <h2 className="card-title">Mint Tokens</h2>
              {!isOwner && (
                <div className="alert alert-warning text-sm">
                  Only the contract owner can mint tokens.
                </div>
              )}
              <div className="form-control gap-4 mt-2">
                <div>
                  <label className="label">
                    <span className="label-text">Recipient Address</span>
                  </label>
                  <AddressInput
                    value={mintTo}
                    onChange={setMintTo}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Amount</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Amount of GOLD to mint"
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
                  disabled={isMinting || !isOwner}
                >
                  {isMinting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Mint GOLD"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Transfer Section */}
          <div className="card bg-base-100 shadow-xl flex-1">
            <div className="card-body">
              <h2 className="card-title">Transfer Tokens</h2>
              <div className="form-control gap-4 mt-2">
                <div>
                  <label className="label">
                    <span className="label-text">Recipient Address</span>
                  </label>
                  <AddressInput
                    value={transferTo}
                    onChange={setTransferTo}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Amount</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Amount of GOLD to transfer"
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
                  disabled={isTransferring}
                >
                  {isTransferring ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Transfer GOLD"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldTokenPage;
