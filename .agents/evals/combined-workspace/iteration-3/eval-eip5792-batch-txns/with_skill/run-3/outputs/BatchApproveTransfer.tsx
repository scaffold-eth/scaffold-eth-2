"use client";

import { useState } from "react";
import { AddressInput } from "@scaffold-ui/components";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useCapabilities, useShowCallsStatus, useWriteContracts } from "wagmi/experimental";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const TOKEN_DECIMALS = 18;

const BatchApproveTransfer = () => {
  const { address: connectedAddress, chainId } = useAccount();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [batchId, setBatchId] = useState<string | undefined>();

  // Get deployed contract info for raw wagmi hooks
  const { data: batchTokenContract } = useDeployedContractInfo({ contractName: "BatchToken" });

  // Detect EIP-5792 wallet capabilities
  const { data: walletCapabilities, isSuccess: isEIP5792Wallet } = useCapabilities({
    account: connectedAddress,
  });

  // EIP-5792 hooks
  const { writeContractsAsync, isPending: isBatchPending } = useWriteContracts();
  const { showCallsStatusAsync } = useShowCallsStatus();

  // Read token state using scaffold hooks
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

  const { data: currentAllowance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "allowance",
    args: [connectedAddress, connectedAddress],
  });

  // Fallback: individual write hooks for non-EIP-5792 wallets
  const { writeContractAsync: writeApprove, isPending: isApprovePending } = useScaffoldWriteContract({
    contractName: "BatchToken",
  });

  const { writeContractAsync: writeTransferFrom, isPending: isTransferPending } = useScaffoldWriteContract({
    contractName: "BatchToken",
  });

  const parsedAmount = transferAmount ? parseUnits(transferAmount, TOKEN_DECIMALS) : 0n;
  const hasEnoughBalance = userBalance !== undefined && parsedAmount > 0n && userBalance >= parsedAmount;
  const isValidRecipient = recipientAddress.length === 42 && recipientAddress.startsWith("0x");
  const canSubmit = hasEnoughBalance && isValidRecipient && parsedAmount > 0n;

  const isAtomicBatchSupported = walletCapabilities?.[chainId ?? 0]?.atomicBatch?.supported;

  // Batch: approve + transferFrom in one wallet interaction
  const handleBatchApproveAndTransfer = async () => {
    if (!batchTokenContract || !connectedAddress || !canSubmit) return;

    try {
      const result = await writeContractsAsync({
        contracts: [
          {
            address: batchTokenContract.address,
            abi: batchTokenContract.abi,
            functionName: "approve",
            args: [connectedAddress, parsedAmount],
          },
          {
            address: batchTokenContract.address,
            abi: batchTokenContract.abi,
            functionName: "transferFrom",
            args: [connectedAddress, recipientAddress, parsedAmount],
          },
        ],
      });

      setBatchId(result.id);
      notification.success("Batch transaction sent! Approve + Transfer in one call.");
    } catch (e: any) {
      console.error("Batch transaction failed:", e);
      notification.error(`Batch failed: ${e.shortMessage || e.message}`);
    }
  };

  // Fallback: separate approve then transferFrom
  const handleIndividualApproveAndTransfer = async () => {
    if (!connectedAddress || !canSubmit) return;

    try {
      notification.info("Step 1/2: Approving tokens...");
      await writeApprove({
        functionName: "approve",
        args: [connectedAddress, parsedAmount],
      });

      notification.info("Step 2/2: Transferring tokens...");
      await writeTransferFrom({
        functionName: "transferFrom",
        args: [connectedAddress, recipientAddress as `0x${string}`, parsedAmount],
      });

      notification.success("Both transactions completed successfully!");
    } catch (e: any) {
      console.error("Individual transaction failed:", e);
      notification.error(`Transaction failed: ${e.shortMessage || e.message}`);
    }
  };

  const handleShowStatus = async () => {
    if (!batchId) return;
    try {
      await showCallsStatusAsync({ id: batchId });
    } catch (e: any) {
      console.error("Show status failed:", e);
      notification.error("Could not show batch status.");
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center">
      {/* Token Info Card */}
      <div className="card bg-base-100 shadow-xl w-full max-w-lg">
        <div className="card-body">
          <h2 className="card-title">
            {tokenName ?? "BatchToken"} ({tokenSymbol ?? "BATCH"})
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm opacity-70">Your Balance:</span>
              <span className="font-mono font-bold">
                {userBalance !== undefined ? formatUnits(userBalance, TOKEN_DECIMALS) : "..."} {tokenSymbol ?? "BATCH"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm opacity-70">Self-Allowance:</span>
              <span className="font-mono">
                {currentAllowance !== undefined ? formatUnits(currentAllowance, TOKEN_DECIMALS) : "..."}{" "}
                {tokenSymbol ?? "BATCH"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EIP-5792 Wallet Detection */}
      <div className="card bg-base-100 shadow-xl w-full max-w-lg">
        <div className="card-body">
          <h2 className="card-title">Wallet Capabilities</h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-70">EIP-5792 Support:</span>
              {isEIP5792Wallet ? (
                <span className="badge badge-success">Supported</span>
              ) : (
                <span className="badge badge-warning">Not Detected</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-70">Atomic Batching:</span>
              {isAtomicBatchSupported ? (
                <span className="badge badge-success">Supported</span>
              ) : (
                <span className="badge badge-ghost">Not Available</span>
              )}
            </div>
            {!isEIP5792Wallet && (
              <p className="text-xs opacity-60 mt-1">
                Your wallet may not support EIP-5792. The batch button still works with SE-2&apos;s burner wallet. For
                full support, try Coinbase Wallet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Form */}
      <div className="card bg-base-100 shadow-xl w-full max-w-lg">
        <div className="card-body">
          <h2 className="card-title">Batch Approve + Transfer</h2>
          <p className="text-sm opacity-70">
            Approve and transfer ERC20 tokens in a single batch call using EIP-5792 (wallet_sendCalls). This batches an{" "}
            <code className="bg-base-300 px-1 rounded">approve</code> and a{" "}
            <code className="bg-base-300 px-1 rounded">transferFrom</code> into one wallet interaction.
          </p>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Recipient Address</span>
            </label>
            <AddressInput value={recipientAddress} onChange={setRecipientAddress} placeholder="0x..." />
          </div>

          <div className="form-control mt-2">
            <label className="label">
              <span className="label-text">Amount ({tokenSymbol ?? "BATCH"})</span>
            </label>
            <input
              type="number"
              placeholder="100"
              className="input input-bordered w-full"
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
              min="0"
              step="any"
            />
            {!hasEnoughBalance && parsedAmount > 0n && (
              <label className="label">
                <span className="label-text-alt text-error">Insufficient balance</span>
              </label>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {/* Batch button — primary action */}
            <button
              className="btn btn-primary w-full"
              onClick={handleBatchApproveAndTransfer}
              disabled={!canSubmit || isBatchPending || !batchTokenContract}
            >
              {isBatchPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Batch: Approve + Transfer (EIP-5792)"
              )}
            </button>

            {/* Fallback individual buttons */}
            <div className="divider text-xs opacity-50">OR use individual transactions</div>
            <button
              className="btn btn-secondary btn-outline w-full"
              onClick={handleIndividualApproveAndTransfer}
              disabled={!canSubmit || isApprovePending || isTransferPending}
            >
              {isApprovePending || isTransferPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Individual: Approve then Transfer (2 txns)"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Batch Status */}
      {batchId && (
        <div className="card bg-base-100 shadow-xl w-full max-w-lg">
          <div className="card-body">
            <h2 className="card-title">Batch Status</h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70">Batch ID:</span>
                <span className="font-mono text-xs truncate max-w-[200px]">{batchId}</span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleShowStatus}>
                Show Batch Status in Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchApproveTransfer;
