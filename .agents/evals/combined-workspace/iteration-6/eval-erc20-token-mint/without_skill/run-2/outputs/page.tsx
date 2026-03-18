"use client";

import { useState } from "react";
import { formatUnits } from "viem";
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
  const [balanceCheckAddress, setBalanceCheckAddress] = useState("");

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

  const { data: checkedBalance } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "balanceOf",
    args: [balanceCheckAddress],
  });

  // Write contract hooks
  const { writeContractAsync: writeGoldToken, isPending: isMintPending } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const { writeContractAsync: writeGoldTokenTransfer, isPending: isTransferPending } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const formatTokenAmount = (amount: bigint | undefined) => {
    if (amount === undefined) return "0";
    return parseFloat(formatUnits(amount, 18)).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  };

  const parseTokenAmount = (value: string): bigint => {
    const parts = value.split(".");
    const whole = parts[0] || "0";
    const fraction = (parts[1] || "").padEnd(18, "0").slice(0, 18);
    return BigInt(whole) * 10n ** 18n + BigInt(fraction);
  };

  const handleMint = async () => {
    if (!mintTo || !mintAmount) {
      notification.error("Please fill in all mint fields");
      return;
    }
    try {
      await writeGoldToken({
        functionName: "mint",
        args: [mintTo, parseTokenAmount(mintAmount)],
      });
      notification.success(`Minted ${mintAmount} GOLD tokens`);
      setMintAmount("");
    } catch (e: any) {
      console.error("Mint failed:", e);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      notification.error("Please fill in all transfer fields");
      return;
    }
    try {
      await writeGoldTokenTransfer({
        functionName: "transfer",
        args: [transferTo, parseTokenAmount(transferAmount)],
      });
      notification.success(`Transferred ${transferAmount} GOLD tokens`);
      setTransferAmount("");
    } catch (e: any) {
      console.error("Transfer failed:", e);
    }
  };

  const isOwner = connectedAddress && ownerAddress && connectedAddress.toLowerCase() === ownerAddress.toLowerCase();

  return (
    <div className="flex items-center flex-col grow pt-10 px-4">
      <h1 className="text-center">
        <span className="block text-4xl font-bold mb-2">
          {tokenName || "GoldToken"} ({tokenSymbol || "GOLD"})
        </span>
        <span className="block text-lg">ERC-20 Token with Capped Supply</span>
      </h1>

      {/* Token Info */}
      <div className="flex flex-col items-center mt-8 gap-2">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Supply</div>
            <div className="stat-value text-primary text-2xl">{formatTokenAmount(totalSupply)} GOLD</div>
          </div>
          <div className="stat">
            <div className="stat-title">Max Supply (Cap)</div>
            <div className="stat-value text-secondary text-2xl">{formatTokenAmount(cap)} GOLD</div>
          </div>
          <div className="stat">
            <div className="stat-title">Your Balance</div>
            <div className="stat-value text-accent text-2xl">{formatTokenAmount(connectedBalance)} GOLD</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-medium">Owner:</span>
          <Address address={ownerAddress} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-10 w-full max-w-4xl">
        {/* Mint Section */}
        <div className="card bg-base-100 shadow-xl flex-1">
          <div className="card-body">
            <h2 className="card-title">Mint Tokens</h2>
            {!isOwner && (
              <div className="alert alert-warning text-sm">Only the contract owner can mint tokens.</div>
            )}
            <div className="form-control gap-4 mt-2">
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
                  type="text"
                  placeholder="e.g. 1000"
                  className="input input-bordered w-full"
                  value={mintAmount}
                  onChange={e => setMintAmount(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleMint}
                disabled={isMintPending || !isOwner}
              >
                {isMintPending ? <span className="loading loading-spinner loading-sm"></span> : "Mint"}
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
                <AddressInput value={transferTo} onChange={setTransferTo} placeholder="0x..." />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Amount (GOLD)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100"
                  className="input input-bordered w-full"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                />
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleTransfer}
                disabled={isTransferPending}
              >
                {isTransferPending ? <span className="loading loading-spinner loading-sm"></span> : "Transfer"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Checker */}
      <div className="card bg-base-100 shadow-xl w-full max-w-md mt-8 mb-10">
        <div className="card-body">
          <h2 className="card-title">Check Balance</h2>
          <div className="form-control gap-4 mt-2">
            <div>
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <AddressInput value={balanceCheckAddress} onChange={setBalanceCheckAddress} placeholder="0x..." />
            </div>
            {balanceCheckAddress && (
              <div className="text-center p-4 bg-base-200 rounded-xl">
                <p className="text-sm text-base-content/70">Balance</p>
                <p className="text-2xl font-bold">{formatTokenAmount(checkedBalance)} GOLD</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldTokenPage;
