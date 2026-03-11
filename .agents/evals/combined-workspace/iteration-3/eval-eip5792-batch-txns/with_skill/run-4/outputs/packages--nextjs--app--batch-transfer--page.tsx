"use client";

import { useState } from "react";
import { Address, AddressInput, IntegerInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const BatchTransfer: NextPage = () => {
  const { address: connectedAddress, chainId } = useAccount();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  // Detect EIP-5792 wallet support
  const { isSuccess: isEIP5792Wallet, data: walletCapabilities } = useCapabilities({
    account: connectedAddress,
  });

  // Get deployed contract info for batch calls
  const { data: deployedContract } = useDeployedContractInfo({ contractName: "BatchToken" });

  // Read token state
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
    args: [connectedAddress, recipient as `0x${string}`],
  });

  // Individual write hooks (fallback for non-EIP-5792 wallets)
  const { writeContractAsync: writeApprove, isPending: isApprovePending } = useScaffoldWriteContract({
    contractName: "BatchToken",
  });

  const { writeContractAsync: writeTransfer, isPending: isTransferPending } = useScaffoldWriteContract({
    contractName: "BatchToken",
  });

  // EIP-5792 batch write
  const { writeContractsAsync, isPending: isBatchPending } = useWriteContracts();

  const parsedAmount = amount ? parseEther(amount) : 0n;

  const handleBatchApproveAndTransfer = async () => {
    if (!deployedContract || !recipient || !amount) {
      notification.error("Please fill in all fields.");
      return;
    }

    try {
      await writeContractsAsync({
        contracts: [
          {
            address: deployedContract.address,
            abi: deployedContract.abi,
            functionName: "approve",
            args: [recipient, parsedAmount],
          },
          {
            address: deployedContract.address,
            abi: deployedContract.abi,
            functionName: "transfer",
            args: [recipient, parsedAmount],
          },
        ],
      });
      notification.success("Batch approve + transfer sent successfully!");
    } catch (e) {
      console.error("Batch transaction failed:", e);
      notification.error("Batch transaction failed. Check console for details.");
    }
  };

  const handleIndividualApprove = async () => {
    if (!recipient || !amount) {
      notification.error("Please fill in all fields.");
      return;
    }
    try {
      await writeApprove({
        functionName: "approve",
        args: [recipient, parsedAmount],
      });
      notification.success("Approval successful!");
    } catch (e) {
      console.error("Approve failed:", e);
      notification.error("Approve failed.");
    }
  };

  const handleIndividualTransfer = async () => {
    if (!recipient || !amount) {
      notification.error("Please fill in all fields.");
      return;
    }
    try {
      await writeTransfer({
        functionName: "transfer",
        args: [recipient, parsedAmount],
      });
      notification.success("Transfer successful!");
    } catch (e) {
      console.error("Transfer failed:", e);
      notification.error("Transfer failed.");
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-xl">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">EIP-5792</span>
          <span className="block text-4xl font-bold">Batch Token Transfer</span>
        </h1>
        <p className="text-center text-lg mt-2">
          Approve and transfer {tokenSymbol || "BATCH"} tokens in a single batch transaction using{" "}
          <code className="bg-base-300 text-base font-bold px-1 rounded">wallet_sendCalls</code>.
        </p>

        {/* Wallet EIP-5792 Support Status */}
        <div className="mt-6">
          <div className={`alert ${isEIP5792Wallet ? "alert-success" : "alert-warning"}`}>
            <span>
              {isEIP5792Wallet
                ? "Your wallet supports EIP-5792 batch transactions."
                : "Your wallet does not support EIP-5792. Use individual transactions below as a fallback."}
            </span>
          </div>
        </div>

        {/* Token Info Card */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">
              {tokenName || "BatchToken"} ({tokenSymbol || "BATCH"})
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-medium">Your Balance:</span>
                <span>{userBalance !== undefined ? formatEther(userBalance) : "---"} {tokenSymbol || "BATCH"}</span>
              </div>
              {recipient && (
                <div className="flex justify-between">
                  <span className="font-medium">Current Allowance for Recipient:</span>
                  <span>
                    {currentAllowance !== undefined ? formatEther(currentAllowance) : "---"} {tokenSymbol || "BATCH"}
                  </span>
                </div>
              )}
              {deployedContract && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Contract:</span>
                  <Address address={deployedContract.address} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Transfer Tokens</h2>
            <div className="form-control gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Recipient Address</span>
                </label>
                <AddressInput value={recipient} onChange={setRecipient} placeholder="0x..." />
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Amount (in tokens)</span>
                </label>
                <IntegerInput
                  value={amount}
                  onChange={val => setAmount(val as string)}
                  placeholder="0"
                  disableMultiplyBy1e18
                />
              </div>
            </div>

            {/* Batch Button (EIP-5792) */}
            <div className="mt-6">
              <button
                className="btn btn-primary w-full"
                disabled={!isEIP5792Wallet || isBatchPending || !recipient || !amount}
                onClick={handleBatchApproveAndTransfer}
              >
                {isBatchPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Batch: Approve + Transfer (EIP-5792)"
                )}
              </button>
              {!isEIP5792Wallet && (
                <p className="text-sm text-center mt-2 opacity-70">
                  Connect an EIP-5792 wallet (e.g. Coinbase Wallet) to use batch transactions.
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="divider">OR use individual transactions</div>

            {/* Individual Transaction Buttons (Fallback) */}
            <div className="flex flex-col gap-3">
              <button
                className="btn btn-secondary w-full"
                disabled={isApprovePending || !recipient || !amount}
                onClick={handleIndividualApprove}
              >
                {isApprovePending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "1. Approve"
                )}
              </button>
              <button
                className="btn btn-secondary w-full"
                disabled={isTransferPending || !recipient || !amount}
                onClick={handleIndividualTransfer}
              >
                {isTransferPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "2. Transfer"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Capabilities Info */}
        {isEIP5792Wallet && walletCapabilities && chainId && (
          <div className="card bg-base-100 shadow-xl mt-6 mb-10">
            <div className="card-body">
              <h2 className="card-title">Wallet Capabilities (Chain {chainId})</h2>
              <pre className="bg-base-300 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(walletCapabilities[chainId] || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchTransfer;
