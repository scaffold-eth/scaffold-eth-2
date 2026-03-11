"use client";

import { useState } from "react";
import { AddressInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const BatchTransfer: NextPage = () => {
  const { address: connectedAddress, chainId } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [mintAmount, setMintAmount] = useState("");

  // Contract info for EIP-5792 batch calls
  const { data: tokenContract } = useDeployedContractInfo("BatchToken");

  // Read token state
  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: tokenName } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "name",
  });

  const { data: tokenSymbol } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "symbol",
  });

  // Check allowance for the recipient (spender)
  const { data: currentAllowance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "allowance",
    args: [connectedAddress, recipient],
  });

  // Individual write hooks (fallback for non-EIP-5792 wallets)
  const { writeContractAsync: writeBatchToken, isPending: isWritePending } = useScaffoldWriteContract({
    contractName: "BatchToken",
  });

  // EIP-5792 wallet capability detection
  const { isSuccess: isEIP5792Wallet, data: walletCapabilities } = useCapabilities({
    account: connectedAddress,
  });

  const isBatchingSupported = isEIP5792Wallet && walletCapabilities?.[chainId!]?.atomicBatch?.supported !== false;

  // EIP-5792 batch write hook
  const { writeContractsAsync, isPending: isBatchPending } = useWriteContracts();

  const parsedAmount = amount ? parseUnits(amount, 18) : 0n;

  const handleMint = async () => {
    if (!mintAmount) {
      notification.error("Please enter an amount to mint");
      return;
    }
    try {
      await writeBatchToken({
        functionName: "mint",
        args: [connectedAddress, parseUnits(mintAmount, 18)],
      });
      notification.success(`Minted ${mintAmount} ${tokenSymbol || "BATCH"} tokens`);
      setMintAmount("");
    } catch (e) {
      console.error("Mint failed:", e);
      notification.error("Minting failed");
    }
  };

  // EIP-5792 batch: approve + transferFrom in one wallet interaction
  const handleBatchApproveAndTransfer = async () => {
    if (!recipient || !amount) {
      notification.error("Please enter a recipient and amount");
      return;
    }
    if (!tokenContract) {
      notification.error("Token contract not loaded");
      return;
    }
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    try {
      await writeContractsAsync({
        contracts: [
          {
            address: tokenContract.address,
            abi: tokenContract.abi,
            functionName: "approve",
            args: [recipient, parsedAmount],
          },
          {
            address: tokenContract.address,
            abi: tokenContract.abi,
            functionName: "transfer",
            args: [recipient, parsedAmount],
          },
        ],
      });
      notification.success(`Batch approve + transfer of ${amount} ${tokenSymbol || "BATCH"} sent!`);
      setAmount("");
      setRecipient("");
    } catch (e) {
      console.error("Batch transaction failed:", e);
      notification.error("Batch transaction failed");
    }
  };

  // Fallback: individual approve then transfer (two separate transactions)
  const handleIndividualApproveAndTransfer = async () => {
    if (!recipient || !amount) {
      notification.error("Please enter a recipient and amount");
      return;
    }
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    try {
      notification.info("Step 1/2: Approving tokens...");
      await writeBatchToken({
        functionName: "approve",
        args: [recipient, parsedAmount],
      });
      notification.success("Approval confirmed. Sending transfer...");

      notification.info("Step 2/2: Transferring tokens...");
      await writeBatchToken({
        functionName: "transfer",
        args: [recipient, parsedAmount],
      });
      notification.success(`Transferred ${amount} ${tokenSymbol || "BATCH"} tokens!`);
      setAmount("");
      setRecipient("");
    } catch (e) {
      console.error("Individual transaction failed:", e);
      notification.error("Transaction failed");
    }
  };

  return (
    <div className="flex flex-col items-center grow pt-10 px-4">
      <h1 className="text-center text-3xl font-bold mb-2">EIP-5792 Batch Token Transfer</h1>
      <p className="text-center text-lg text-base-content/70 max-w-xl mb-8">
        Approve and transfer ERC-20 tokens in a single batch transaction using{" "}
        <code className="bg-base-300 px-1 rounded">wallet_sendCalls</code>
      </p>

      {/* Wallet EIP-5792 Support Status */}
      <div className="mb-6">
        {isEIP5792Wallet ? (
          <div className="badge badge-success gap-2">EIP-5792 Supported</div>
        ) : (
          <div className="badge badge-warning gap-2">EIP-5792 Not Detected — using individual transactions</div>
        )}
      </div>

      <div className="flex flex-col gap-6 w-full max-w-lg">
        {/* Token Info Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              {tokenName || "BatchToken"} ({tokenSymbol || "BATCH"})
            </h2>
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Your Balance:</span>
              <span className="font-mono text-lg">
                {tokenBalance !== undefined ? formatUnits(tokenBalance, 18) : "0"} {tokenSymbol || "BATCH"}
              </span>
            </div>
            {recipient && currentAllowance !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Allowance for recipient:</span>
                <span className="font-mono">{formatUnits(currentAllowance, 18)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mint Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Mint Test Tokens</h2>
            <p className="text-sm text-base-content/70">Get some tokens to test batch transfers.</p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Amount to Mint</span>
              </label>
              <input
                type="number"
                placeholder="100"
                className="input input-bordered w-full"
                value={mintAmount}
                onChange={e => setMintAmount(e.target.value)}
              />
            </div>
            <div className="card-actions justify-end mt-2">
              <button className="btn btn-secondary" onClick={handleMint} disabled={isWritePending || !mintAmount}>
                {isWritePending ? <span className="loading loading-spinner loading-sm"></span> : "Mint Tokens"}
              </button>
            </div>
          </div>
        </div>

        {/* Batch Transfer Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Approve + Transfer</h2>
            <p className="text-sm text-base-content/70">
              {isBatchingSupported
                ? "Both approve and transfer will execute in a single batch transaction via EIP-5792."
                : "Approve and transfer will be sent as two separate transactions."}
            </p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Recipient Address</span>
              </label>
              <AddressInput value={recipient} onChange={setRecipient} placeholder="0x..." />
            </div>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Amount</span>
              </label>
              <input
                type="number"
                placeholder="10"
                className="input input-bordered w-full"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div className="card-actions justify-end mt-4">
              {isBatchingSupported ? (
                <button
                  className="btn btn-primary"
                  onClick={handleBatchApproveAndTransfer}
                  disabled={isBatchPending || !recipient || !amount}
                >
                  {isBatchPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Batch Approve + Transfer"
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleIndividualApproveAndTransfer}
                  disabled={isWritePending || !recipient || !amount}
                >
                  {isWritePending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Approve + Transfer (2 txns)"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTransfer;
