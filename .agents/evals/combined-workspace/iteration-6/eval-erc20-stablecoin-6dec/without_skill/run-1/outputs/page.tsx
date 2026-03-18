"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Address, AddressInput } from "@scaffold-ui/components";
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

  const { data: maxSupply } = useScaffoldReadContract({
    contractName: "SilverDollar",
    functionName: "MAX_SUPPLY",
  });

  const { data: connectedBalance } = useScaffoldReadContract({
    contractName: "SilverDollar",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: ownerAddress } = useScaffoldReadContract({
    contractName: "SilverDollar",
    functionName: "owner",
  });

  // Write contract hooks
  const { writeContractAsync: writeSilverDollar, isPending: isMintPending } = useScaffoldWriteContract({
    contractName: "SilverDollar",
  });

  const { writeContractAsync: writeTransfer, isPending: isTransferPending } = useScaffoldWriteContract({
    contractName: "SilverDollar",
  });

  const isOwner = connectedAddress && ownerAddress && connectedAddress.toLowerCase() === ownerAddress.toLowerCase();

  const handleMint = async () => {
    if (!mintTo || !mintAmount) {
      notification.error("Please fill in both fields");
      return;
    }

    try {
      const parsedAmount = parseUnits(mintAmount, SLVR_DECIMALS);
      await writeSilverDollar({
        functionName: "mint",
        args: [mintTo, parsedAmount],
      });
      notification.success(`Minted ${mintAmount} SLVR`);
      setMintAmount("");
    } catch (e: any) {
      console.error("Mint error:", e);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      notification.error("Please fill in both fields");
      return;
    }

    try {
      const parsedAmount = parseUnits(transferAmount, SLVR_DECIMALS);
      await writeTransfer({
        functionName: "transfer",
        args: [transferTo, parsedAmount],
      });
      notification.success(`Transferred ${transferAmount} SLVR`);
      setTransferAmount("");
    } catch (e: any) {
      console.error("Transfer error:", e);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center mb-4">
          <span className="block text-4xl font-bold">
            {tokenName ?? "SilverDollar"} ({tokenSymbol ?? "SLVR"})
          </span>
          <span className="block text-lg mt-2 text-base-content/70">Stablecoin with 6 decimals</span>
        </h1>

        {/* Token Info Card */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/70">Total Supply</p>
                <p className="text-xl font-semibold">{formatSlvr(totalSupply)} SLVR</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Max Supply</p>
                <p className="text-xl font-semibold">{formatSlvr(maxSupply)} SLVR</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Your Balance</p>
                <p className="text-xl font-semibold">{formatSlvr(connectedBalance)} SLVR</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Owner</p>
                {ownerAddress ? <Address address={ownerAddress} /> : <span>-</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Mint Section (Owner Only) */}
        {isOwner && (
          <div className="card bg-base-100 shadow-xl mb-6">
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
                    type="number"
                    placeholder="e.g. 1000"
                    className="input input-bordered w-full"
                    value={mintAmount}
                    onChange={e => setMintAmount(e.target.value)}
                    step="0.000001"
                    min="0"
                  />
                </div>
                <button className="btn btn-primary" onClick={handleMint} disabled={isMintPending}>
                  {isMintPending ? <span className="loading loading-spinner loading-sm"></span> : "Mint SLVR"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Section */}
        <div className="card bg-base-100 shadow-xl mb-6">
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
                  type="number"
                  placeholder="e.g. 100"
                  className="input input-bordered w-full"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  step="0.000001"
                  min="0"
                />
              </div>
              <button className="btn btn-secondary" onClick={handleTransfer} disabled={isTransferPending}>
                {isTransferPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Transfer SLVR"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SilverDollarPage;
