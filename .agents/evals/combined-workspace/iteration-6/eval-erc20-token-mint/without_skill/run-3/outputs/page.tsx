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
  const { writeContractAsync: writeGoldToken, isPending: isMintPending } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const { writeContractAsync: writeGoldTokenTransfer, isPending: isTransferPending } = useScaffoldWriteContract({
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
      notification.error("Please fill in both mint address and amount.");
      return;
    }
    try {
      await writeGoldToken({
        functionName: "mint",
        args: [mintTo, parseUnits(mintAmount, 18)],
      });
      notification.success(`Successfully minted ${mintAmount} GOLD!`);
      setMintAmount("");
    } catch (e: any) {
      console.error("Mint error:", e);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      notification.error("Please fill in both transfer address and amount.");
      return;
    }
    try {
      await writeGoldTokenTransfer({
        functionName: "transfer",
        args: [transferTo, parseUnits(transferAmount, 18)],
      });
      notification.success(`Successfully transferred ${transferAmount} GOLD!`);
      setTransferAmount("");
    } catch (e: any) {
      console.error("Transfer error:", e);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold mb-2">
            {tokenName ?? "GoldToken"} ({tokenSymbol ?? "GOLD"})
          </span>
          <span className="block text-lg text-base-content/70">ERC-20 Token with Capped Supply</span>
        </h1>

        {/* Token Info */}
        <div className="flex flex-col items-center gap-2 mt-8">
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div className="stat">
              <div className="stat-title">Total Supply</div>
              <div className="stat-value text-lg">{formatTokenAmount(totalSupply)}</div>
              <div className="stat-desc">GOLD minted</div>
            </div>
            <div className="stat">
              <div className="stat-title">Max Supply (Cap)</div>
              <div className="stat-value text-lg">{formatTokenAmount(cap)}</div>
              <div className="stat-desc">GOLD maximum</div>
            </div>
            <div className="stat">
              <div className="stat-title">Your Balance</div>
              <div className="stat-value text-lg">{formatTokenAmount(connectedBalance)}</div>
              <div className="stat-desc">GOLD</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-medium">Owner:</span>
            <Address address={owner} />
          </div>
        </div>

        {/* Mint Section */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Mint Tokens (Owner Only)</h2>
            <p className="text-sm text-base-content/70">
              Mint new GOLD tokens to any address. Only the contract owner can mint.
            </p>
            <div className="form-control gap-3 mt-2">
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
              <button className="btn btn-primary" onClick={handleMint} disabled={isMintPending}>
                {isMintPending ? <span className="loading loading-spinner loading-sm"></span> : "Mint GOLD"}
              </button>
            </div>
          </div>
        </div>

        {/* Transfer Section */}
        <div className="card bg-base-100 shadow-xl mt-6 mb-10">
          <div className="card-body">
            <h2 className="card-title">Transfer Tokens</h2>
            <p className="text-sm text-base-content/70">Send GOLD tokens to another address.</p>
            <div className="form-control gap-3 mt-2">
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
              <button className="btn btn-secondary" onClick={handleTransfer} disabled={isTransferPending}>
                {isTransferPending ? <span className="loading loading-spinner loading-sm"></span> : "Transfer GOLD"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldTokenPage;
