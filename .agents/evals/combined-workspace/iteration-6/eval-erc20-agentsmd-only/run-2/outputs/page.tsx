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

  const { data: ownerAddress } = useScaffoldReadContract({
    contractName: "GoldToken",
    functionName: "owner",
  });

  // Write contract functions
  const { writeContractAsync: mintTokens, isPending: isMinting } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const { writeContractAsync: transferTokens, isPending: isTransferring } = useScaffoldWriteContract({
    contractName: "GoldToken",
  });

  const handleMint = async () => {
    if (!mintTo || !mintAmount) {
      notification.error("Please fill in both address and amount");
      return;
    }
    try {
      await mintTokens({
        functionName: "mint",
        args: [mintTo, parseUnits(mintAmount, 18)],
      });
      notification.success(`Minted ${mintAmount} GOLD tokens`);
      setMintAmount("");
    } catch (e: unknown) {
      const error = e as Error;
      notification.error(error.message || "Minting failed");
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      notification.error("Please fill in both address and amount");
      return;
    }
    try {
      await transferTokens({
        functionName: "transfer",
        args: [transferTo, parseUnits(transferAmount, 18)],
      });
      notification.success(`Transferred ${transferAmount} GOLD tokens`);
      setTransferAmount("");
    } catch (e: unknown) {
      const error = e as Error;
      notification.error(error.message || "Transfer failed");
    }
  };

  const formatTokenAmount = (amount: bigint | undefined) => {
    if (amount === undefined) return "0";
    return formatUnits(amount, 18);
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">
            {tokenName || "GoldToken"} ({tokenSymbol || "GOLD"})
          </span>
        </h1>

        {/* Token Info */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-70">Total Supply</p>
                <p className="font-bold">{formatTokenAmount(totalSupply)} GOLD</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Max Supply (Cap)</p>
                <p className="font-bold">{formatTokenAmount(cap)} GOLD</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Your Balance</p>
                <p className="font-bold">{formatTokenAmount(connectedBalance)} GOLD</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Owner</p>
                {ownerAddress && <Address address={ownerAddress} />}
              </div>
            </div>
          </div>
        </div>

        {/* Mint Section */}
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
                  <span className="label-text">Amount (GOLD)</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="input input-bordered w-full"
                  value={mintAmount}
                  onChange={e => setMintAmount(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={handleMint} disabled={isMinting}>
                {isMinting ? <span className="loading loading-spinner"></span> : "Mint"}
              </button>
            </div>
          </div>
        </div>

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
                  <span className="label-text">Amount (GOLD)</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="input input-bordered w-full"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary" onClick={handleTransfer} disabled={isTransferring}>
                {isTransferring ? <span className="loading loading-spinner"></span> : "Transfer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldTokenPage;
