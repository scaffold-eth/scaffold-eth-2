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

  const handleMint = async () => {
    if (!mintTo || !mintAmount) {
      notification.error("Please fill in both the recipient address and amount.");
      return;
    }

    try {
      await writeGoldToken({
        functionName: "mint",
        args: [mintTo, parseUnits(mintAmount, 18)],
      });
      notification.success(`Successfully minted ${mintAmount} GOLD!`);
      setMintAmount("");
    } catch (e) {
      console.error("Minting failed:", e);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      notification.error("Please fill in both the recipient address and amount.");
      return;
    }

    try {
      await writeGoldTokenTransfer({
        functionName: "transfer",
        args: [transferTo, parseUnits(transferAmount, 18)],
      });
      notification.success(`Successfully transferred ${transferAmount} GOLD!`);
      setTransferAmount("");
    } catch (e) {
      console.error("Transfer failed:", e);
    }
  };

  const formatTokenBalance = (balance: bigint | undefined) => {
    if (balance === undefined) return "0.0";
    return formatUnits(balance, 18);
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-3xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold mb-2">GoldToken (GOLD)</span>
          <span className="block text-lg text-base-content/70">ERC-20 Token with Capped Supply</span>
        </h1>

        {/* Token Info Card */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/70">Name</p>
                <p className="font-medium">{tokenName ?? "..."}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Symbol</p>
                <p className="font-medium">{tokenSymbol ?? "..."}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Total Supply</p>
                <p className="font-medium">{formatTokenBalance(totalSupply)} GOLD</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Max Supply (Cap)</p>
                <p className="font-medium">{formatTokenBalance(cap)} GOLD</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-base-content/70">Owner</p>
                <Address address={ownerAddress} />
              </div>
            </div>
          </div>
        </div>

        {/* Your Balance Card */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Your Balance</h2>
            <p className="text-3xl font-bold">{formatTokenBalance(connectedBalance)} GOLD</p>
          </div>
        </div>

        {/* Mint Card (Owner Only) */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Mint Tokens (Owner Only)</h2>
            <p className="text-sm text-base-content/70">Only the contract owner can mint new GOLD tokens.</p>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Recipient Address</span>
              </label>
              <AddressInput value={mintTo} onChange={setMintTo} placeholder="Enter recipient address" />
            </div>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Amount (GOLD)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 1000"
                className="input input-bordered w-full"
                value={mintAmount}
                onChange={e => setMintAmount(e.target.value)}
              />
            </div>
            <div className="card-actions mt-4">
              <button className="btn btn-primary w-full" onClick={handleMint} disabled={isMintPending}>
                {isMintPending ? <span className="loading loading-spinner loading-sm"></span> : "Mint GOLD"}
              </button>
            </div>
          </div>
        </div>

        {/* Transfer Card */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Transfer Tokens</h2>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Recipient Address</span>
              </label>
              <AddressInput value={transferTo} onChange={setTransferTo} placeholder="Enter recipient address" />
            </div>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Amount (GOLD)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                className="input input-bordered w-full"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
              />
            </div>
            <div className="card-actions mt-4">
              <button className="btn btn-secondary w-full" onClick={handleTransfer} disabled={isTransferPending}>
                {isTransferPending ? <span className="loading loading-spinner loading-sm"></span> : "Transfer GOLD"}
              </button>
            </div>
          </div>
        </div>

        {/* Check Balance Card */}
        <div className="card bg-base-100 shadow-xl mt-6 mb-10">
          <div className="card-body">
            <h2 className="card-title">Check Balance</h2>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <AddressInput
                value={balanceCheckAddress}
                onChange={setBalanceCheckAddress}
                placeholder="Enter address to check"
              />
            </div>
            {balanceCheckAddress && (
              <div className="mt-4 p-4 bg-base-200 rounded-xl">
                <p className="text-sm text-base-content/70">Balance</p>
                <p className="text-2xl font-bold">{formatTokenBalance(checkedBalance)} GOLD</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldTokenPage;
