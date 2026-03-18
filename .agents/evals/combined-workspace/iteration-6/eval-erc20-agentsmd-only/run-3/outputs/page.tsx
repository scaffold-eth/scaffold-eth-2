"use client";

import { useState } from "react";
import { Address, AddressInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatUnits } from "viem";
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

  const { data: maxSupply } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "MAX_SUPPLY",
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
  const { writeContractAsync: writeGoldToken, isPending: isMintPending } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const { writeContractAsync: writeGoldTokenTransfer, isPending: isTransferPending } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const formatTokenAmount = (amount: bigint | undefined): string => {
    if (amount === undefined) return "0";
    return parseFloat(formatUnits(amount, 18)).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  };

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === owner.toLowerCase();

  const handleMint = async () => {
    if (!mintTo || !mintAmount) {
      notification.error("Please fill in all mint fields");
      return;
    }

    try {
      const amountInWei = BigInt(Math.floor(parseFloat(mintAmount) * 10 ** 18));
      await writeGoldToken({
        functionName: "mint",
        args: [mintTo, amountInWei],
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
      const amountInWei = BigInt(Math.floor(parseFloat(transferAmount) * 10 ** 18));
      await writeGoldTokenTransfer({
        functionName: "transfer",
        args: [transferTo, amountInWei],
      });
      notification.success(`Successfully transferred ${transferAmount} GOLD`);
      setTransferAmount("");
    } catch (e) {
      console.error("Transfer failed:", e);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">
            {tokenName || "GoldToken"} ({tokenSymbol || "GOLD"})
          </span>
          <span className="block text-lg mt-2">ERC-20 Token with Capped Supply</span>
        </h1>

        {/* Token Stats */}
        <div className="flex justify-center gap-6 mt-8 flex-wrap">
          <div className="card bg-base-100 shadow-xl p-6 min-w-[200px]">
            <h3 className="text-sm font-semibold opacity-70">Total Supply</h3>
            <p className="text-2xl font-bold">{formatTokenAmount(totalSupply)}</p>
            <p className="text-xs opacity-50">GOLD</p>
          </div>
          <div className="card bg-base-100 shadow-xl p-6 min-w-[200px]">
            <h3 className="text-sm font-semibold opacity-70">Max Supply</h3>
            <p className="text-2xl font-bold">{formatTokenAmount(maxSupply)}</p>
            <p className="text-xs opacity-50">GOLD</p>
          </div>
          <div className="card bg-base-100 shadow-xl p-6 min-w-[200px]">
            <h3 className="text-sm font-semibold opacity-70">Your Balance</h3>
            <p className="text-2xl font-bold">{formatTokenAmount(connectedBalance)}</p>
            <p className="text-xs opacity-50">GOLD</p>
          </div>
        </div>

        {/* Owner Info */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">Contract Owner:</span>
            <Address address={owner} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-10 justify-center">
          {/* Mint Section (Owner Only) */}
          <div className="card bg-base-100 shadow-xl w-full md:w-1/2">
            <div className="card-body">
              <h2 className="card-title">Mint Tokens</h2>
              {isOwner ? (
                <>
                  <p className="text-sm opacity-70">Mint new GOLD tokens to any address (owner only).</p>
                  <div className="form-control mt-4">
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
                      placeholder="100"
                      className="input input-bordered w-full"
                      value={mintAmount}
                      onChange={e => setMintAmount(e.target.value)}
                      min="0"
                      step="any"
                    />
                  </div>
                  <div className="card-actions mt-4">
                    <button className="btn btn-primary w-full" onClick={handleMint} disabled={isMintPending}>
                      {isMintPending ? <span className="loading loading-spinner loading-sm"></span> : "Mint GOLD"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="alert alert-warning mt-4">
                  <span>Only the contract owner can mint tokens.</span>
                </div>
              )}
            </div>
          </div>

          {/* Transfer Section */}
          <div className="card bg-base-100 shadow-xl w-full md:w-1/2">
            <div className="card-body">
              <h2 className="card-title">Transfer Tokens</h2>
              <p className="text-sm opacity-70">Send GOLD tokens to another address.</p>
              <div className="form-control mt-4">
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
                  placeholder="50"
                  className="input input-bordered w-full"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  min="0"
                  step="any"
                />
              </div>
              <div className="card-actions mt-4">
                <button className="btn btn-secondary w-full" onClick={handleTransfer} disabled={isTransferPending}>
                  {isTransferPending ? (
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
