"use client";

import { useState } from "react";
import { AddressInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const TOKEN_DECIMALS = 18;

const BatchTransfer: NextPage = () => {
  const { address: connectedAddress, chainId } = useAccount();

  // Form state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  // Get deployed contract info for EIP-5792 batch calls
  const { data: batchTokenContract } = useDeployedContractInfo("BatchToken");

  // Detect EIP-5792 wallet support
  const { isSuccess: isEIP5792Wallet, data: walletCapabilities } = useCapabilities({
    account: connectedAddress,
  });

  // EIP-5792 batch write
  const { writeContractsAsync, isPending: isBatchPending } = useWriteContracts();

  // Read contract state
  const { data: tokenName } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "name",
  });

  const { data: tokenSymbol } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "symbol",
  });

  const { data: userBalance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "totalSupply",
  });

  // Fallback: individual approve + transfer for non-EIP-5792 wallets
  const { writeContractAsync: writeApprove, isPending: isApprovePending } = useScaffoldWriteContract({
    contractName: "BatchToken",
  });

  const { writeContractAsync: writeTransfer, isPending: isTransferPending } = useScaffoldWriteContract({
    contractName: "BatchToken",
  });

  const parsedAmount = amount ? parseUnits(amount, TOKEN_DECIMALS) : 0n;

  // Check if paymaster is supported on the current chain
  const isPaymasterSupported = walletCapabilities?.[chainId ?? 0]?.paymasterService?.supported;

  const handleBatchApproveAndTransfer = async () => {
    if (!batchTokenContract || !recipient || !parsedAmount) {
      notification.error("Please fill in all fields");
      return;
    }

    try {
      const batchId = await writeContractsAsync({
        contracts: [
          {
            address: batchTokenContract.address,
            abi: batchTokenContract.abi,
            functionName: "approve",
            args: [recipient, parsedAmount],
          },
          {
            address: batchTokenContract.address,
            abi: batchTokenContract.abi,
            functionName: "transfer",
            args: [recipient, parsedAmount],
          },
        ],
      });

      notification.success(`Batch transaction sent! ID: ${batchId}`);
    } catch (e: any) {
      console.error("Batch transaction failed:", e);
      notification.error("Batch transaction failed: " + (e?.shortMessage || e?.message || "Unknown error"));
    }
  };

  const handleIndividualApproveAndTransfer = async () => {
    if (!recipient || !parsedAmount) {
      notification.error("Please fill in all fields");
      return;
    }

    try {
      // Step 1: Approve
      notification.info("Step 1/2: Approving tokens...");
      await writeApprove({
        functionName: "approve",
        args: [recipient, parsedAmount],
      });
      notification.success("Approval confirmed!");

      // Step 2: Transfer
      notification.info("Step 2/2: Transferring tokens...");
      await writeTransfer({
        functionName: "transfer",
        args: [recipient, parsedAmount],
      });
      notification.success("Transfer complete!");
    } catch (e: any) {
      console.error("Transaction failed:", e);
      notification.error("Transaction failed: " + (e?.shortMessage || e?.message || "Unknown error"));
    }
  };

  const isFormValid = recipient && amount && parseFloat(amount) > 0;
  const isFallbackPending = isApprovePending || isTransferPending;

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">EIP-5792</span>
          <span className="block text-4xl font-bold">Batch Token Transfers</span>
        </h1>
        <p className="text-center text-lg mt-2">
          Approve and transfer ERC-20 tokens in a single batch transaction using{" "}
          <code className="bg-base-300 px-1 rounded">wallet_sendCalls</code>
        </p>

        {/* Token Info Card */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-60">Name</p>
                <p className="font-medium">{tokenName ?? "Loading..."}</p>
              </div>
              <div>
                <p className="text-sm opacity-60">Symbol</p>
                <p className="font-medium">{tokenSymbol ?? "Loading..."}</p>
              </div>
              <div>
                <p className="text-sm opacity-60">Total Supply</p>
                <p className="font-medium">
                  {totalSupply !== undefined ? formatUnits(totalSupply, TOKEN_DECIMALS) : "Loading..."}{" "}
                  {tokenSymbol ?? ""}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-60">Your Balance</p>
                <p className="font-medium">
                  {userBalance !== undefined ? formatUnits(userBalance, TOKEN_DECIMALS) : "Loading..."}{" "}
                  {tokenSymbol ?? ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Capability Detection */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Wallet Capabilities</h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className={`badge ${isEIP5792Wallet ? "badge-success" : "badge-warning"}`}>
                  {isEIP5792Wallet ? "Supported" : "Not Detected"}
                </div>
                <span>EIP-5792 (wallet_sendCalls)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`badge ${isPaymasterSupported ? "badge-success" : "badge-ghost"}`}>
                  {isPaymasterSupported ? "Supported" : "N/A"}
                </div>
                <span>Paymaster (ERC-7677)</span>
              </div>
              {!isEIP5792Wallet && (
                <p className="text-sm opacity-60 mt-2">
                  Your wallet does not support EIP-5792. You can still approve and transfer individually using the
                  fallback method below. For full batch support, try Coinbase Wallet or another EIP-5792 compliant
                  wallet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Batch Transfer Form */}
        <div className="card bg-base-100 shadow-xl mt-6 mb-10">
          <div className="card-body">
            <h2 className="card-title">Approve & Transfer</h2>
            <p className="text-sm opacity-60 mb-4">
              {isEIP5792Wallet
                ? "Both approve and transfer will execute in a single batched wallet interaction."
                : "Approve and transfer will require two separate wallet confirmations."}
            </p>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Recipient Address</span>
              </label>
              <AddressInput value={recipient} onChange={setRecipient} placeholder="0x..." />
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Amount ({tokenSymbol ?? "BATCH"})</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                className="input input-bordered w-full"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
              {userBalance !== undefined && (
                <label className="label">
                  <span className="label-text-alt">
                    Available: {formatUnits(userBalance, TOKEN_DECIMALS)} {tokenSymbol ?? ""}
                  </span>
                  <button
                    className="label-text-alt link"
                    onClick={() => setAmount(formatUnits(userBalance, TOKEN_DECIMALS))}
                  >
                    Max
                  </button>
                </label>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {/* Primary: Batch transaction (EIP-5792) */}
              <button
                className={`btn btn-primary w-full ${isBatchPending ? "loading" : ""}`}
                onClick={handleBatchApproveAndTransfer}
                disabled={!isFormValid || isBatchPending || !isEIP5792Wallet || !batchTokenContract}
              >
                {isBatchPending ? <span className="loading loading-spinner loading-sm"></span> : null}
                Batch Approve & Transfer (EIP-5792)
              </button>

              {/* Fallback: Individual transactions */}
              <div className="divider text-sm opacity-60">or use individual transactions</div>
              <button
                className={`btn btn-secondary w-full ${isFallbackPending ? "loading" : ""}`}
                onClick={handleIndividualApproveAndTransfer}
                disabled={!isFormValid || isFallbackPending}
              >
                {isFallbackPending ? <span className="loading loading-spinner loading-sm"></span> : null}
                Approve & Transfer (2 transactions)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTransfer;
