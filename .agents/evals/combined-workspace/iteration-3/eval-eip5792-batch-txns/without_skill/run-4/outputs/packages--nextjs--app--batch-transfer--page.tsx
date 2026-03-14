"use client";

import { useState } from "react";
import { Address, AddressInput, IntegerInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { useAccount, useSendCalls, useWaitForCallsStatus } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const BatchTransfer: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [spenderAddress, setSpenderAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState<string | bigint>("");

  const { data: batchTokenContract } = useDeployedContractInfo({ contractName: "BatchToken" });

  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true,
  });

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

  const { data: currentAllowance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "allowance",
    args: [connectedAddress, spenderAddress as `0x${string}`],
    watch: true,
  });

  const {
    sendCallsAsync,
    isPending: isBatchPending,
    data: batchCallsId,
  } = useSendCalls();

  const { data: callsStatus } = useWaitForCallsStatus({
    id: batchCallsId as string,
    query: {
      enabled: !!batchCallsId,
    },
  });

  const decimals = tokenDecimals ?? 18;

  const handleBatchApproveAndTransfer = async () => {
    if (!batchTokenContract?.address) {
      notification.error("BatchToken contract not deployed. Run `yarn deploy`.");
      return;
    }
    if (!connectedAddress) {
      notification.error("Please connect your wallet.");
      return;
    }
    if (!spenderAddress) {
      notification.error("Please enter a spender/recipient address.");
      return;
    }
    if (!amount) {
      notification.error("Please enter an amount.");
      return;
    }

    const parsedAmount = typeof amount === "bigint" ? amount : parseUnits(amount, decimals);
    const tokenAddress = batchTokenContract.address;

    // Use the same address for both spender (approve) and recipient (transferFrom)
    // so the approval is immediately useful. In a real scenario, the spender might be
    // a different contract (like a DEX router) that calls transferFrom on behalf of the user.
    const targetAddr = (recipientAddress || spenderAddress) as `0x${string}`;

    try {
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddress as `0x${string}`, parsedAmount],
      });

      const transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [targetAddr, parsedAmount],
      });

      await sendCallsAsync({
        calls: [
          {
            to: tokenAddress,
            data: approveData,
            value: 0n,
          },
          {
            to: tokenAddress,
            data: transferData,
            value: 0n,
          },
        ],
      });

      notification.success("Batch transaction sent! Approve + Transfer in one go.");
    } catch (e: unknown) {
      console.error("Batch call failed:", e);
      notification.error("Batch transaction failed. Check console for details.");
    }
  };

  const formatTokenAmount = (raw: bigint | undefined) => {
    if (raw === undefined) return "0";
    const num = Number(raw) / 10 ** decimals;
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="text-center">
        <span className="block text-2xl mb-2">EIP-5792</span>
        <span className="block text-4xl font-bold">Batch Token Transfer</span>
      </h1>

      <p className="text-center text-lg max-w-2xl mt-4">
        Approve and transfer ERC-20 tokens in a single batch transaction using{" "}
        <code className="bg-base-300 px-1 rounded">wallet_sendCalls</code> (EIP-5792).
        Both calls are submitted together so the wallet processes them atomically.
      </p>

      {/* Token Info Card */}
      <div className="card bg-base-100 shadow-xl w-full max-w-lg mt-8">
        <div className="card-body">
          <h2 className="card-title">Token Info</h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span>{tokenName ?? "Loading..."}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Symbol:</span>
              <span>{tokenSymbol ?? "Loading..."}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Your Balance:</span>
              <span>
                {formatTokenAmount(tokenBalance)} {tokenSymbol ?? ""}
              </span>
            </div>
            {spenderAddress && (
              <div className="flex justify-between">
                <span className="font-medium">Current Allowance:</span>
                <span>
                  {formatTokenAmount(currentAllowance)} {tokenSymbol ?? ""}
                </span>
              </div>
            )}
            {batchTokenContract?.address && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Contract:</span>
                <Address address={batchTokenContract.address} chain={targetNetwork} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Transfer Form */}
      <div className="card bg-base-100 shadow-xl w-full max-w-lg mt-6">
        <div className="card-body">
          <h2 className="card-title">Batch Approve + Transfer</h2>
          <p className="text-sm opacity-70">
            This sends two calls in one batch: first <strong>approve</strong> the spender, then{" "}
            <strong>transfer</strong> tokens to the recipient.
          </p>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text font-medium">Spender Address (for approval)</span>
            </label>
            <AddressInput
              value={spenderAddress}
              onChange={setSpenderAddress}
              placeholder="0x... address to approve"
            />
          </div>

          <div className="form-control mt-2">
            <label className="label">
              <span className="label-text font-medium">Recipient Address (for transfer)</span>
            </label>
            <AddressInput
              value={recipientAddress}
              onChange={setRecipientAddress}
              placeholder="0x... (defaults to spender if empty)"
            />
          </div>

          <div className="form-control mt-2">
            <label className="label">
              <span className="label-text font-medium">Amount (tokens)</span>
            </label>
            <IntegerInput
              value={amount}
              onChange={setAmount}
              placeholder="Amount of tokens"
            />
          </div>

          <div className="card-actions mt-6">
            <button
              className="btn btn-primary w-full"
              onClick={handleBatchApproveAndTransfer}
              disabled={isBatchPending || !connectedAddress}
            >
              {isBatchPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Send Batch: Approve + Transfer"
              )}
            </button>
          </div>

          {/* Status Display */}
          {batchCallsId && (
            <div className="mt-4 p-3 bg-base-200 rounded-lg">
              <p className="text-sm font-medium">Batch Call ID:</p>
              <p className="text-xs break-all font-mono">{batchCallsId}</p>
              {callsStatus && (
                <div className="mt-2">
                  <p className="text-sm font-medium">
                    Status:{" "}
                    <span
                      className={`badge ${
                        callsStatus.status === "CONFIRMED"
                          ? "badge-success"
                          : callsStatus.status === "PENDING"
                            ? "badge-warning"
                            : "badge-error"
                      }`}
                    >
                      {callsStatus.status}
                    </span>
                  </p>
                  {callsStatus.receipts && callsStatus.receipts.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Transaction Receipts:</p>
                      {callsStatus.receipts.map((receipt, idx) => (
                        <div key={idx} className="text-xs mt-1">
                          <span className="font-mono break-all">
                            Tx {idx + 1}: {receipt.transactionHash}
                          </span>
                          <span
                            className={`ml-2 badge badge-sm ${
                              receipt.status === "success" ? "badge-success" : "badge-error"
                            }`}
                          >
                            {receipt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="card bg-base-100 shadow-xl w-full max-w-lg mt-6 mb-10">
        <div className="card-body">
          <h2 className="card-title">How It Works</h2>
          <div className="text-sm space-y-2">
            <p>
              <strong>EIP-5792</strong> defines <code className="bg-base-300 px-1 rounded">wallet_sendCalls</code>,
              a wallet RPC method that lets dApps submit multiple contract calls as a single batch.
            </p>
            <p>
              This page demonstrates batching two ERC-20 operations:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li><strong>approve</strong> - Grant a spender permission to use your tokens</li>
              <li><strong>transfer</strong> - Send tokens to a recipient</li>
            </ol>
            <p>
              Instead of two separate transaction confirmations, the wallet handles both in one
              user action. Wagmi provides the <code className="bg-base-300 px-1 rounded">useSendCalls</code>{" "}
              hook that wraps this RPC method.
            </p>
            <p className="opacity-70">
              Note: Not all wallets support EIP-5792 yet. Smart contract wallets and
              newer embedded wallets typically have the best support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTransfer;
