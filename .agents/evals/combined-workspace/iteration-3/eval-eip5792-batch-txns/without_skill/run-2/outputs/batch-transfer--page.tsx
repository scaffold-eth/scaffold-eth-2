"use client";

import { useState } from "react";
import { Address as AddressComp, AddressInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { Address, encodeFunctionData, erc20Abi, formatUnits, parseUnits } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useCallsStatus, useSendCalls } from "wagmi";
import {
  useDeployedContractInfo,
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const BatchTransfer: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [batchCallId, setBatchCallId] = useState<string | undefined>();

  // Get deployed contract info for BatchToken
  const { data: batchTokenContract } = useDeployedContractInfo({ contractName: "BatchToken" });

  // Read token balance of connected address
  const { data: tokenBalance, refetch: refetchBalance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Read token allowance (connected address approving the connected address itself, for demo)
  const { data: tokenAllowance, refetch: refetchAllowance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "allowance",
    args: [connectedAddress, connectedAddress],
  });

  // Read token symbol
  const { data: tokenSymbol } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "symbol",
  });

  // Read token decimals
  const { data: tokenDecimals } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "decimals",
  });

  // Mint tokens using SE-2 hook
  const { writeContractAsync: writeBatchToken, isPending: isMintPending } = useScaffoldWriteContract({
    contractName: "BatchToken",
  });

  // EIP-5792 useSendCalls for batching approve + transferFrom
  const { sendCallsAsync, isPending: isBatchPending } = useSendCalls();

  // Track batch call status via EIP-5792 wallet_getCallsStatus
  const { data: callsStatus } = useCallsStatus({
    id: batchCallId as string,
    query: {
      enabled: !!batchCallId,
      refetchInterval: data => {
        if (data.state.data?.status === "success" || data.state.data?.status === "failure") return false;
        return 2000;
      },
    },
  });

  const handleMint = async () => {
    try {
      await writeBatchToken({
        functionName: "mint",
      });
      notification.success("Minted 1,000 BATCH tokens!");
      refetchBalance();
    } catch (e) {
      console.error("Error minting tokens:", e);
    }
  };

  const handleBatchApproveAndTransfer = async () => {
    if (!connectedAddress || !batchTokenContract) {
      notification.error("Please connect your wallet and ensure the contract is deployed.");
      return;
    }

    if (!recipientAddress) {
      notification.error("Please enter a recipient address.");
      return;
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      notification.error("Please enter a valid transfer amount.");
      return;
    }

    const decimals = tokenDecimals ?? 18;
    const amountInWei = parseUnits(transferAmount, decimals);

    if (tokenBalance !== undefined && amountInWei > tokenBalance) {
      notification.error("Insufficient token balance. Mint more tokens first.");
      return;
    }

    try {
      // Batch two calls via EIP-5792 wallet_sendCalls:
      // 1. approve(connectedAddress, amount) - approve self as spender
      // 2. transferFrom(connectedAddress, recipient, amount) - transfer using the approval
      //
      // This demonstrates the power of EIP-5792: both calls execute atomically
      // in a single user interaction, rather than requiring two separate confirmations.
      const result = await sendCallsAsync({
        calls: [
          {
            to: batchTokenContract.address,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [connectedAddress, amountInWei],
            }),
          },
          {
            to: batchTokenContract.address,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transferFrom",
              args: [connectedAddress, recipientAddress as Address, amountInWei],
            }),
          },
        ],
      });

      setBatchCallId(result.id);
      notification.success("Batch transaction sent! Approve + Transfer in a single call.");

      // Reset form
      setTransferAmount("");

      // Refetch balances after a short delay
      setTimeout(() => {
        refetchBalance();
        refetchAllowance();
      }, 3000);
    } catch (e: unknown) {
      console.error("Error sending batch calls:", e);
      notification.error("Batch transaction failed. Your wallet may not support EIP-5792.");
    }
  };

  // Also support a simpler batch: just approve + transfer (using transfer instead of transferFrom)
  const handleBatchApproveAndDirectTransfer = async () => {
    if (!connectedAddress || !batchTokenContract) {
      notification.error("Please connect your wallet and ensure the contract is deployed.");
      return;
    }

    if (!recipientAddress) {
      notification.error("Please enter a recipient address.");
      return;
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      notification.error("Please enter a valid transfer amount.");
      return;
    }

    const decimals = tokenDecimals ?? 18;
    const amountInWei = parseUnits(transferAmount, decimals);

    if (tokenBalance !== undefined && amountInWei > tokenBalance) {
      notification.error("Insufficient token balance. Mint more tokens first.");
      return;
    }

    try {
      // Batch two calls via EIP-5792 wallet_sendCalls:
      // 1. approve(recipient, amount) - approve the recipient as spender
      // 2. transfer(recipient, amount) - directly transfer tokens
      //
      // This pattern is common in DeFi: approve a protocol + deposit in one step.
      const result = await sendCallsAsync({
        calls: [
          {
            to: batchTokenContract.address,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [recipientAddress as Address, amountInWei],
            }),
          },
          {
            to: batchTokenContract.address,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [recipientAddress as Address, amountInWei],
            }),
          },
        ],
      });

      setBatchCallId(result.id);
      notification.success("Batch transaction sent! Approve + Transfer in one call.");

      setTransferAmount("");

      setTimeout(() => {
        refetchBalance();
        refetchAllowance();
      }, 3000);
    } catch (e: unknown) {
      console.error("Error sending batch calls:", e);
      notification.error("Batch transaction failed. Your wallet may not support EIP-5792.");
    }
  };

  const decimals = tokenDecimals ?? 18;
  const formattedBalance = tokenBalance !== undefined ? formatUnits(tokenBalance, decimals) : "0";
  const formattedAllowance = tokenAllowance !== undefined ? formatUnits(tokenAllowance, decimals) : "0";

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">EIP-5792 Batch Transfers</span>
        </h1>
        <p className="text-center text-lg mt-2">
          Approve and transfer ERC20 tokens in a single batch transaction using{" "}
          <code className="bg-base-300 text-base font-bold px-1 rounded">wallet_sendCalls</code>
        </p>

        {/* Token Info Card */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Token:</span>
                <span>{tokenSymbol ?? "BATCH"} (BatchToken)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Contract:</span>
                {batchTokenContract ? (
                  <AddressComp
                    address={batchTokenContract.address}
                    chain={targetNetwork}
                    blockExplorerAddressLink={
                      targetNetwork.id === hardhat.id
                        ? `/blockexplorer/address/${batchTokenContract.address}`
                        : undefined
                    }
                  />
                ) : (
                  <span className="text-error">Not deployed</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Your Balance:</span>
                <span className="font-mono text-lg">
                  {formattedBalance} {tokenSymbol ?? "BATCH"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Self Allowance:</span>
                <span className="font-mono">
                  {formattedAllowance} {tokenSymbol ?? "BATCH"}
                </span>
              </div>
            </div>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-secondary btn-sm" onClick={handleMint} disabled={isMintPending}>
                {isMintPending ? <span className="loading loading-spinner loading-sm"></span> : null}
                Mint 1,000 {tokenSymbol ?? "BATCH"}
              </button>
            </div>
          </div>
        </div>

        {/* Batch Transfer Card */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Batch Approve + Transfer</h2>
            <p className="text-sm opacity-70">
              Using EIP-5792, both the approval and transfer execute in a single wallet interaction. No more two-step
              approve-then-transfer flow.
            </p>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-semibold">Recipient Address</span>
              </label>
              <AddressInput
                placeholder="Enter recipient address"
                value={recipientAddress}
                onChange={value => setRecipientAddress(value)}
              />
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-semibold">Amount ({tokenSymbol ?? "BATCH"})</span>
              </label>
              <input
                type="number"
                placeholder="Enter amount to transfer"
                className="input input-bordered w-full"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
                min="0"
                step="any"
              />
              {tokenBalance !== undefined && (
                <label className="label">
                  <span className="label-text-alt">
                    Available: {formattedBalance} {tokenSymbol ?? "BATCH"}
                  </span>
                  <button
                    className="label-text-alt link link-primary"
                    onClick={() => setTransferAmount(formattedBalance)}
                  >
                    Max
                  </button>
                </label>
              )}
            </div>

            <div className="card-actions flex-col gap-3 mt-6">
              <button
                className="btn btn-primary w-full"
                onClick={handleBatchApproveAndTransfer}
                disabled={isBatchPending || !connectedAddress}
              >
                {isBatchPending ? <span className="loading loading-spinner loading-sm"></span> : null}
                Batch: Approve Self + TransferFrom
              </button>
              <div className="divider my-0">OR</div>
              <button
                className="btn btn-accent w-full"
                onClick={handleBatchApproveAndDirectTransfer}
                disabled={isBatchPending || !connectedAddress}
              >
                {isBatchPending ? <span className="loading loading-spinner loading-sm"></span> : null}
                Batch: Approve Recipient + Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Batch Call Status */}
        {batchCallId && (
          <div className="card bg-base-100 shadow-xl mt-6 mb-8">
            <div className="card-body">
              <h2 className="card-title">Batch Call Status</h2>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Call ID:</span>
                  <span className="font-mono text-xs break-all">{batchCallId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`badge ${
                      callsStatus?.status === "success"
                        ? "badge-success"
                        : callsStatus?.status === "pending"
                          ? "badge-warning"
                          : callsStatus?.status === "failure"
                            ? "badge-error"
                            : "badge-info"
                    }`}
                  >
                    {callsStatus?.status ?? "unknown"}
                  </span>
                </div>
                {callsStatus?.receipts && callsStatus.receipts.length > 0 && (
                  <div className="mt-2">
                    <span className="font-semibold">Transaction Receipts:</span>
                    {callsStatus.receipts.map((receipt, index) => (
                      <div key={index} className="mt-1 p-2 bg-base-200 rounded">
                        <span className="text-xs font-mono break-all">Tx Hash: {receipt.transactionHash}</span>
                        <br />
                        <span className="text-xs">Status: {receipt.status === "success" ? "Success" : "Reverted"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div className="card bg-base-100 shadow-xl mt-6 mb-12">
          <div className="card-body">
            <h2 className="card-title">How EIP-5792 Batch Transactions Work</h2>
            <div className="space-y-3 text-sm">
              <p>
                <strong>EIP-5792</strong> introduces <code className="bg-base-300 px-1 rounded">wallet_sendCalls</code>,
                a JSON-RPC method that allows dApps to send multiple calls to a wallet in a single request.
              </p>
              <div className="divider my-1"></div>
              <p className="font-semibold">Traditional Flow (2 transactions):</p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                <li>
                  User confirms <code className="bg-base-300 px-1 rounded">approve(spender, amount)</code>
                </li>
                <li>Wait for confirmation...</li>
                <li>
                  User confirms <code className="bg-base-300 px-1 rounded">transferFrom(from, to, amount)</code>
                </li>
              </ol>
              <div className="divider my-1"></div>
              <p className="font-semibold">EIP-5792 Batch Flow (1 interaction):</p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                <li>
                  dApp calls <code className="bg-base-300 px-1 rounded">wallet_sendCalls</code> with both approve and
                  transfer calls
                </li>
                <li>User confirms once</li>
                <li>Both calls execute atomically</li>
              </ol>
              <div className="divider my-1"></div>
              <p className="opacity-70">
                Note: EIP-5792 requires wallet support. Smart contract wallets and some modern EOA wallets support this
                feature. If your wallet does not support it, the batch call will fail gracefully.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTransfer;
