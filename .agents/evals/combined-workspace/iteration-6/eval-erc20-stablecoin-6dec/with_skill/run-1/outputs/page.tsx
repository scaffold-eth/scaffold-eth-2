"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const TOKEN_DECIMALS = 6;
const CONTRACT_NAME = "SilverDollar";

const formatSlvr = (value: bigint | undefined): string => {
  if (value === undefined) return "0";
  return formatUnits(value, TOKEN_DECIMALS);
};

const SilverDollarPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // Mint form state
  const [mintTo, setMintTo] = useState("");
  const [mintAmount, setMintAmount] = useState("");

  // Transfer form state
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // Read contract data
  const { data: tokenName } = useScaffoldReadContract({
    contractName: CONTRACT_NAME,
    functionName: "name",
  });

  const { data: tokenSymbol } = useScaffoldReadContract({
    contractName: CONTRACT_NAME,
    functionName: "symbol",
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: CONTRACT_NAME,
    functionName: "totalSupply",
  });

  const { data: cap } = useScaffoldReadContract({
    contractName: CONTRACT_NAME,
    functionName: "cap",
  });

  const { data: connectedBalance } = useScaffoldReadContract({
    contractName: CONTRACT_NAME,
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: CONTRACT_NAME,
    functionName: "owner",
  });

  // Write contract hooks
  const { writeContractAsync: writeSilverDollar, isPending: isMintPending } = useScaffoldWriteContract({
    contractName: CONTRACT_NAME,
  });

  const { writeContractAsync: writeTransfer, isPending: isTransferPending } = useScaffoldWriteContract({
    contractName: CONTRACT_NAME,
  });

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === owner.toLowerCase();

  const handleMint = async () => {
    if (!mintTo || !mintAmount) return;
    try {
      const parsedAmount = parseUnits(mintAmount, TOKEN_DECIMALS);
      await writeSilverDollar({
        functionName: "mint",
        args: [mintTo, parsedAmount],
      });
      setMintAmount("");
    } catch (e) {
      console.error("Minting failed:", e);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) return;
    try {
      const parsedAmount = parseUnits(transferAmount, TOKEN_DECIMALS);
      await writeTransfer({
        functionName: "transfer",
        args: [transferTo, parsedAmount],
      });
      setTransferAmount("");
    } catch (e) {
      console.error("Transfer failed:", e);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-3xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">
            {tokenName ?? "SilverDollar"} ({tokenSymbol ?? "SLVR"})
          </span>
          <span className="block text-base mt-2 text-neutral">Stablecoin with 6 decimals</span>
        </h1>

        {/* Token Info */}
        <div className="flex flex-col items-center mt-8">
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div className="stat">
              <div className="stat-title">Total Supply</div>
              <div className="stat-value text-xl">{formatSlvr(totalSupply)} SLVR</div>
            </div>
            <div className="stat">
              <div className="stat-title">Max Supply (Cap)</div>
              <div className="stat-value text-xl">{formatSlvr(cap)} SLVR</div>
            </div>
            <div className="stat">
              <div className="stat-title">Your Balance</div>
              <div className="stat-value text-xl">{formatSlvr(connectedBalance)} SLVR</div>
            </div>
          </div>
        </div>

        {/* Mint Section - Only visible to owner */}
        {isOwner && (
          <div className="card bg-base-100 shadow-xl mt-8">
            <div className="card-body">
              <h2 className="card-title">Mint Tokens (Owner Only)</h2>
              <div className="form-control gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Recipient Address</span>
                  </label>
                  <AddressInput value={mintTo} onChange={setMintTo} placeholder="0x..." />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Amount (SLVR)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1000"
                    className="input input-bordered w-full"
                    value={mintAmount}
                    onChange={e => setMintAmount(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleMint} disabled={isMintPending || !mintTo || !mintAmount}>
                  {isMintPending ? "Minting..." : "Mint SLVR"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Section */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Transfer Tokens</h2>
            <div className="form-control gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Recipient Address</span>
                </label>
                <AddressInput value={transferTo} onChange={setTransferTo} placeholder="0x..." />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Amount (SLVR)</span>
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
                disabled={isTransferPending || !transferTo || !transferAmount}
              >
                {isTransferPending ? "Transferring..." : "Transfer SLVR"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SilverDollarPage;
