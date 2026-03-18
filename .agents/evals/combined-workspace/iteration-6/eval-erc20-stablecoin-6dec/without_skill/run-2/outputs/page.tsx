"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Address, AddressInput } from "@scaffold-ui/components";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth/getParsedError";

const SLVR_DECIMALS = 6;

const formatSlvr = (value: bigint | undefined): string => {
  if (value === undefined) return "0.000000";
  return formatUnits(value, SLVR_DECIMALS);
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

  // Write contract hooks
  const { writeContractAsync: writeSilverDollar, isPending: isMintPending } = useScaffoldWriteContract({
    contractName: "SilverDollar",
  });

  const { writeContractAsync: writeTransfer, isPending: isTransferPending } = useScaffoldWriteContract({
    contractName: "SilverDollar",
  });

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === owner.toLowerCase();

  const handleMint = async () => {
    if (!mintTo || !mintAmount) {
      notification.error("Please fill in all fields");
      return;
    }

    try {
      const amountInSmallestUnit = parseUnits(mintAmount, SLVR_DECIMALS);
      await writeSilverDollar({
        functionName: "mint",
        args: [mintTo, amountInSmallestUnit],
      });
      notification.success(`Successfully minted ${mintAmount} SLVR`);
      setMintAmount("");
    } catch (e) {
      const parsedError = getParsedError(e);
      notification.error(parsedError);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      notification.error("Please fill in all fields");
      return;
    }

    try {
      const amountInSmallestUnit = parseUnits(transferAmount, SLVR_DECIMALS);
      await writeTransfer({
        functionName: "transfer",
        args: [transferTo, amountInSmallestUnit],
      });
      notification.success(`Successfully transferred ${transferAmount} SLVR`);
      setTransferAmount("");
    } catch (e) {
      const parsedError = getParsedError(e);
      notification.error(parsedError);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center mb-6">
          <span className="block text-2xl mb-2">
            {tokenName ?? "SilverDollar"} ({tokenSymbol ?? "SLVR"})
          </span>
          <span className="block text-4xl font-bold">Stablecoin Dashboard</span>
        </h1>

        {/* Token Info */}
        <div className="flex justify-center gap-6 flex-wrap mb-10">
          <div className="card bg-base-100 shadow-xl px-6 py-4">
            <h3 className="text-sm font-semibold opacity-70">Your Balance</h3>
            <p className="text-2xl font-bold">{formatSlvr(connectedBalance)} SLVR</p>
          </div>
          <div className="card bg-base-100 shadow-xl px-6 py-4">
            <h3 className="text-sm font-semibold opacity-70">Total Supply</h3>
            <p className="text-2xl font-bold">{formatSlvr(totalSupply)} SLVR</p>
          </div>
          <div className="card bg-base-100 shadow-xl px-6 py-4">
            <h3 className="text-sm font-semibold opacity-70">Max Supply (Cap)</h3>
            <p className="text-2xl font-bold">{formatSlvr(maxSupply)} SLVR</p>
          </div>
          <div className="card bg-base-100 shadow-xl px-6 py-4">
            <h3 className="text-sm font-semibold opacity-70">Contract Owner</h3>
            <Address address={owner} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {/* Mint Section - Owner Only */}
          <div className="card bg-base-100 shadow-xl flex-1">
            <div className="card-body">
              <h2 className="card-title">Mint SLVR Tokens</h2>
              {!isOwner && (
                <div className="alert alert-warning text-sm">
                  Only the contract owner can mint tokens.
                </div>
              )}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Recipient Address</span>
                </label>
                <AddressInput value={mintTo} onChange={setMintTo} placeholder="0x..." />
              </div>
              <div className="form-control">
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
              <div className="card-actions mt-4">
                <button
                  className="btn btn-primary w-full"
                  onClick={handleMint}
                  disabled={!isOwner || isMintPending || !mintTo || !mintAmount}
                >
                  {isMintPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Mint Tokens"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Transfer Section */}
          <div className="card bg-base-100 shadow-xl flex-1">
            <div className="card-body">
              <h2 className="card-title">Transfer SLVR Tokens</h2>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Recipient Address</span>
                </label>
                <AddressInput value={transferTo} onChange={setTransferTo} placeholder="0x..." />
              </div>
              <div className="form-control">
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
              <div className="card-actions mt-4">
                <button
                  className="btn btn-secondary w-full"
                  onClick={handleTransfer}
                  disabled={isTransferPending || !transferTo || !transferAmount}
                >
                  {isTransferPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Transfer Tokens"
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

export default SilverDollarPage;
