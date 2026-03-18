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

  const handleMint = async () => {
    if (!mintTo || !mintAmount) {
      notification.error("Please fill in all mint fields");
      return;
    }
    try {
      await writeGoldToken({
        functionName: "mint",
        args: [mintTo, parseUnits(mintAmount, 18)],
      });
      notification.success(`Minted ${mintAmount} GOLD tokens`);
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
      await writeGoldTokenTransfer({
        functionName: "transfer",
        args: [transferTo, parseUnits(transferAmount, 18)],
      });
      notification.success(`Transferred ${transferAmount} GOLD tokens`);
      setTransferAmount("");
    } catch (e) {
      console.error("Transfer failed:", e);
    }
  };

  const formatTokenAmount = (amount: bigint | undefined) => {
    if (amount === undefined) return "0";
    return formatUnits(amount, 18);
  };

  const isOwner = connectedAddress && owner && connectedAddress.toLowerCase() === owner.toLowerCase();

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">
            {tokenName || "GoldToken"} ({tokenSymbol || "GOLD"})
          </span>
        </h1>

        {/* Token Info */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <tbody>
                  <tr>
                    <td className="font-semibold">Total Supply</td>
                    <td>{formatTokenAmount(totalSupply)} GOLD</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Max Supply (Cap)</td>
                    <td>{formatTokenAmount(cap)} GOLD</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Your Balance</td>
                    <td>{formatTokenAmount(connectedBalance)} GOLD</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Owner</td>
                    <td>
                      <Address address={owner} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mint Section - Only visible to owner */}
        {isOwner && (
          <div className="card bg-base-100 shadow-xl mt-6">
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
                    placeholder="Amount of tokens to mint"
                    className="input input-bordered w-full"
                    value={mintAmount}
                    onChange={e => setMintAmount(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleMint} disabled={isMintPending}>
                  {isMintPending ? <span className="loading loading-spinner"></span> : "Mint GOLD"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Section */}
        <div className="card bg-base-100 shadow-xl mt-6 mb-8">
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
                  placeholder="Amount of tokens to transfer"
                  className="input input-bordered w-full"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary" onClick={handleTransfer} disabled={isTransferPending}>
                {isTransferPending ? <span className="loading loading-spinner"></span> : "Transfer GOLD"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldTokenPage;
