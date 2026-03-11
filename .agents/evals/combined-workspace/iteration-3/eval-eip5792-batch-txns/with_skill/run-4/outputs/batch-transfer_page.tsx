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
  const { address: connectedAddress } = useAccount();

  // Form state
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [mintAmount, setMintAmount] = useState("");

  // Get deployed contract info for EIP-5792 batch calls
  const { data: batchTokenContract } = useDeployedContractInfo({ contractName: "BatchToken" });

  // Check if wallet supports EIP-5792
  const { isSuccess: isEIP5792Wallet } = useCapabilities({
    account: connectedAddress,
  });

  // Batch transaction hook
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

  const { data: tokenDecimals } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "decimals",
  });

  const { data: userBalance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: currentAllowance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "allowance",
    args: [connectedAddress, recipientAddress as `0x${string}`],
  });

  // Individual write hooks (fallback for non-EIP-5792 wallets)
  const { writeContractAsync: writeBatchToken, isPending: isWritePending } = useScaffoldWriteContract({
    contractName: "BatchToken",
  });

  const decimals = tokenDecimals ?? 18;

  const formattedBalance = userBalance !== undefined ? formatUnits(userBalance, decimals) : "0";
  const formattedAllowance =
    currentAllowance !== undefined && recipientAddress ? formatUnits(currentAllowance, decimals) : "0";

  const handleMint = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }
    if (!mintAmount || mintAmount === "0") {
      notification.error("Please enter an amount to mint");
      return;
    }

    try {
      await writeBatchToken({
        functionName: "mint",
        args: [connectedAddress, parseUnits(mintAmount, decimals)],
      });
      notification.success(`Minted ${mintAmount} ${tokenSymbol ?? "BATCH"} tokens`);
      setMintAmount("");
    } catch (e) {
      console.error("Mint failed:", e);
    }
  };

  // EIP-5792 batch: approve + transferFrom in one wallet interaction
  const handleBatchApproveAndTransfer = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }
    if (!recipientAddress) {
      notification.error("Please enter a recipient address");
      return;
    }
    if (!transferAmount || transferAmount === "0") {
      notification.error("Please enter a transfer amount");
      return;
    }
    if (!batchTokenContract) {
      notification.error("BatchToken contract not deployed. Run `yarn deploy`.");
      return;
    }

    const parsedAmount = parseUnits(transferAmount, decimals);

    if (userBalance !== undefined && parsedAmount > userBalance) {
      notification.error("Insufficient token balance");
      return;
    }

    try {
      const id = await writeContractsAsync({
        contracts: [
          {
            address: batchTokenContract.address,
            abi: batchTokenContract.abi,
            functionName: "approve",
            args: [recipientAddress, parsedAmount],
          },
          {
            address: batchTokenContract.address,
            abi: batchTokenContract.abi,
            functionName: "transfer",
            args: [recipientAddress, parsedAmount],
          },
        ],
      });
      notification.success(
        `Batch transaction sent! Approved and transferred ${transferAmount} ${tokenSymbol ?? "BATCH"} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
      );
      console.log("Batch call ID:", id);
      setTransferAmount("");
    } catch (e: any) {
      console.error("Batch transaction failed:", e);
      notification.error("Batch transaction failed. Check console for details.");
    }
  };

  // Fallback: individual approve then transfer (two separate transactions)
  const handleIndividualApproveAndTransfer = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }
    if (!recipientAddress) {
      notification.error("Please enter a recipient address");
      return;
    }
    if (!transferAmount || transferAmount === "0") {
      notification.error("Please enter a transfer amount");
      return;
    }

    const parsedAmount = parseUnits(transferAmount, decimals);

    if (userBalance !== undefined && parsedAmount > userBalance) {
      notification.error("Insufficient token balance");
      return;
    }

    try {
      notification.info("Step 1/2: Approving tokens...");
      await writeBatchToken({
        functionName: "approve",
        args: [recipientAddress as `0x${string}`, parsedAmount],
      });
      notification.success("Approval confirmed. Sending transfer...");

      notification.info("Step 2/2: Transferring tokens...");
      await writeBatchToken({
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, parsedAmount],
      });
      notification.success(
        `Transferred ${transferAmount} ${tokenSymbol ?? "BATCH"} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
      );
      setTransferAmount("");
    } catch (e: any) {
      console.error("Individual transaction failed:", e);
      notification.error("Transaction failed. Check console for details.");
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">EIP-5792 Batch Transfer</span>
          <span className="block text-lg mt-2">Approve + Transfer tokens in a single wallet interaction</span>
        </h1>

        {/* Wallet capability badge */}
        <div className="flex justify-center mt-4">
          {isEIP5792Wallet ? (
            <div className="badge badge-success gap-2 p-3">EIP-5792 Supported</div>
          ) : (
            <div className="badge badge-warning gap-2 p-3">EIP-5792 Not Detected — fallback mode available</div>
          )}
        </div>

        {/* Token Info Card */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">
              Token Info: {tokenName ?? "BatchToken"} ({tokenSymbol ?? "BATCH"})
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-70">Your Balance</p>
                <p className="text-xl font-bold">
                  {formattedBalance} {tokenSymbol ?? "BATCH"}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-70">Current Allowance for Recipient</p>
                <p className="text-xl font-bold">
                  {formattedAllowance} {tokenSymbol ?? "BATCH"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mint Card */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Mint Test Tokens</h2>
            <p className="text-sm opacity-70">Mint tokens to your address for testing.</p>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Amount to Mint</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={mintAmount}
                onChange={e => setMintAmount(e.target.value)}
                placeholder="100"
                min="0"
              />
            </div>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-secondary" onClick={handleMint} disabled={isWritePending}>
                {isWritePending ? <span className="loading loading-spinner loading-sm"></span> : "Mint Tokens"}
              </button>
            </div>
          </div>
        </div>

        {/* Batch Transfer Card */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Approve & Transfer Tokens</h2>
            <p className="text-sm opacity-70">
              {isEIP5792Wallet
                ? "Uses EIP-5792 to batch approve + transfer into a single wallet prompt."
                : "Your wallet does not support EIP-5792 batching. Transactions will be sent individually (two prompts)."}
            </p>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Recipient Address</span>
              </label>
              <AddressInput value={recipientAddress} onChange={setRecipientAddress} placeholder="0x..." />
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Amount</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
                placeholder="50"
                min="0"
              />
            </div>

            <div className="card-actions justify-end mt-6 gap-2">
              {isEIP5792Wallet ? (
                <button
                  className="btn btn-primary"
                  onClick={handleBatchApproveAndTransfer}
                  disabled={isBatchPending || !recipientAddress || !transferAmount}
                >
                  {isBatchPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Batch Approve & Transfer (EIP-5792)"
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleIndividualApproveAndTransfer}
                  disabled={isWritePending || !recipientAddress || !transferAmount}
                >
                  {isWritePending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Approve & Transfer (2 Txns)"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="card bg-base-300 mt-6 mb-10">
          <div className="card-body">
            <h2 className="card-title">How It Works</h2>
            <div className="text-sm space-y-2">
              <p>
                <strong>With EIP-5792 (batch):</strong> The <code>approve</code> and <code>transfer</code> calls are
                bundled into a single <code>wallet_sendCalls</code> request. Your wallet handles both in one prompt — no
                waiting between transactions.
              </p>
              <p>
                <strong>Without EIP-5792 (fallback):</strong> Each call is sent as a separate{" "}
                <code>eth_sendTransaction</code>. You&apos;ll sign approve first, wait for confirmation, then sign the
                transfer.
              </p>
              <p>
                <strong>Wallet support:</strong> SE-2&apos;s burner wallet supports EIP-5792 with sequential
                (non-atomic) execution. For atomic batching and paymaster support, use Coinbase Wallet or another{" "}
                <a
                  href="https://www.eip5792.xyz/ecosystem/wallets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  compliant wallet
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTransfer;
