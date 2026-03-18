"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { AddressInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const SLVR_DECIMALS = 6;

const formatSlvr = (value: bigint | undefined): string => {
  if (value === undefined) return "0";
  return formatUnits(value, SLVR_DECIMALS);
};

const SilverDollarPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const [mintTo, setMintTo] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // Read contract data
  const { data: tokenName } = useScaffoldReadContract({
    contractName: "SilverDollar",
    functionName: "name",
  });

  const { data: tokenSymbol } = useScaffoldReadContract({
    contractName: "SilverDollar",
    functionName: "symbol",
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "SilverDollar",
    functionName: "totalSupply",
  });

  const { data: cap } = useScaffoldReadContract({
    contractName: "SilverDollar",
    functionName: "cap",
  });

  const { data: connectedBalance } = useScaffoldReadContract({
    contractName: "SilverDollar",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: "SilverDollar",
    functionName: "owner",
  });

  // Write hooks
  const { writeContractAsync: writeSilverDollar, isPending: isMinting } = useScaffoldWriteContract({
    contractName: "SilverDollar",
  });

  const { writeContractAsync: writeTransfer, isPending: isTransferring } = useScaffoldWriteContract({
    contractName: "SilverDollar",
  });

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === owner.toLowerCase();

  const handleMint = async () => {
    if (!mintTo || !mintAmount) {
      notification.error("Please fill in all mint fields");
      return;
    }
    try {
      const amountInSmallestUnit = parseUnits(mintAmount, SLVR_DECIMALS);
      await writeSilverDollar({
        functionName: "mint",
        args: [mintTo, amountInSmallestUnit],
      });
      notification.success(`Minted ${mintAmount} SLVR`);
      setMintAmount("");
    } catch (e: unknown) {
      const error = e as Error;
      notification.error(error.message || "Minting failed");
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      notification.error("Please fill in all transfer fields");
      return;
    }
    try {
      const amountInSmallestUnit = parseUnits(transferAmount, SLVR_DECIMALS);
      await writeTransfer({
        functionName: "transfer",
        args: [transferTo, amountInSmallestUnit],
      });
      notification.success(`Transferred ${transferAmount} SLVR`);
      setTransferAmount("");
    } catch (e: unknown) {
      const error = e as Error;
      notification.error(error.message || "Transfer failed");
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="text-4xl font-bold mb-2">
        {tokenName || "SilverDollar"} ({tokenSymbol || "SLVR"})
      </h1>
      <p className="text-lg text-base-content/70 mb-8">Stablecoin with {SLVR_DECIMALS} decimals</p>

      {/* Token Info */}
      <div className="stats shadow mb-8">
        <div className="stat">
          <div className="stat-title">Your Balance</div>
          <div className="stat-value text-primary">{formatSlvr(connectedBalance)}</div>
          <div className="stat-desc">SLVR</div>
        </div>
        <div className="stat">
          <div className="stat-title">Total Supply</div>
          <div className="stat-value">{formatSlvr(totalSupply)}</div>
          <div className="stat-desc">SLVR</div>
        </div>
        <div className="stat">
          <div className="stat-title">Max Supply (Cap)</div>
          <div className="stat-value">{formatSlvr(cap)}</div>
          <div className="stat-desc">SLVR</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        {/* Mint Section (Owner Only) */}
        <div className="card bg-base-100 shadow-xl flex-1">
          <div className="card-body">
            <h2 className="card-title">Mint Tokens</h2>
            {isOwner ? (
              <>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Recipient Address</span>
                  </label>
                  <AddressInput value={mintTo} onChange={setMintTo} placeholder="0x..." />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Amount (SLVR)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    className="input input-bordered w-full"
                    value={mintAmount}
                    onChange={e => setMintAmount(e.target.value)}
                    min="0"
                    step="0.000001"
                  />
                </div>
                <div className="card-actions mt-4">
                  <button className="btn btn-primary w-full" onClick={handleMint} disabled={isMinting}>
                    {isMinting ? <span className="loading loading-spinner"></span> : "Mint SLVR"}
                  </button>
                </div>
              </>
            ) : (
              <div className="alert alert-warning">
                <span>Only the contract owner can mint tokens.</span>
              </div>
            )}
          </div>
        </div>

        {/* Transfer Section */}
        <div className="card bg-base-100 shadow-xl flex-1">
          <div className="card-body">
            <h2 className="card-title">Transfer Tokens</h2>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Recipient Address</span>
              </label>
              <AddressInput value={transferTo} onChange={setTransferTo} placeholder="0x..." />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Amount (SLVR)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                className="input input-bordered w-full"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
                min="0"
                step="0.000001"
              />
            </div>
            <div className="card-actions mt-4">
              <button className="btn btn-secondary w-full" onClick={handleTransfer} disabled={isTransferring}>
                {isTransferring ? <span className="loading loading-spinner"></span> : "Transfer SLVR"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SilverDollarPage;
