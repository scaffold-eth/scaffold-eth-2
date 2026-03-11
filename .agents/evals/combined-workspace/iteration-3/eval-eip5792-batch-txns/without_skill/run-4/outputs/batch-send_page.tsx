"use client";

import { useState } from "react";
import { Address as AddressDisplay, AddressInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useSendCalls, useWaitForCallsStatus } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const BatchSend: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [spenderAddress, setSpenderAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [approveAmount, setApproveAmount] = useState("");

  const { data: tokenContractData } = useDeployedContractInfo({ contractName: "BatchToken" });

  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "balanceOf",
    args: [connectedAddress],
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
  });

  const { sendCallsAsync, isPending: isBatchPending, data: batchCallsId } = useSendCalls();

  const { data: callsStatus } = useWaitForCallsStatus({
    id: batchCallsId?.id as string,
    query: {
      enabled: !!batchCallsId?.id,
    },
  });

  const decimals = tokenDecimals ?? 18;

  const formatTokenBalance = (balance: bigint | undefined) => {
    if (balance === undefined) return "0";
    const formatted = Number(balance) / 10 ** decimals;
    return formatted.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const getStatusBadgeClass = (status: string | undefined) => {
    if (status === "success") return "badge-success";
    if (status === "pending") return "badge-warning";
    if (status === "failure") return "badge-error";
    return "badge-info";
  };

  const handleBatchApproveAndTransfer = async () => {
    if (!tokenContractData?.address) {
      notification.error("BatchToken contract not deployed. Run `yarn deploy` first.");
      return;
    }
    if (!recipientAddress) {
      notification.error("Please enter a recipient address.");
      return;
    }
    if (!spenderAddress) {
      notification.error("Please enter a spender address for approval.");
      return;
    }
    if (!approveAmount || !transferAmount) {
      notification.error("Please enter both approve and transfer amounts.");
      return;
    }

    try {
      const parsedApproveAmount = parseUnits(approveAmount, decimals);
      const parsedTransferAmount = parseUnits(transferAmount, decimals);

      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddress as `0x${string}`, parsedApproveAmount],
      });

      const transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, parsedTransferAmount],
      });

      await sendCallsAsync({
        calls: [
          {
            to: tokenContractData.address,
            data: approveData,
          },
          {
            to: tokenContractData.address,
            data: transferData,
          },
        ],
      });

      notification.success("Batch transaction sent successfully!");
    } catch (error: any) {
      console.error("Batch transaction failed:", error);
      notification.error(`Batch transaction failed: ${error.shortMessage || error.message}`);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center mb-6">
          <span className="block text-2xl mb-2">EIP-5792</span>
          <span className="block text-4xl font-bold">Batch Transactions</span>
        </h1>

        <p className="text-center text-lg mb-8">
          Approve a spender and transfer tokens in a single batch using{" "}
          <code className="bg-base-300 text-base font-bold px-1 rounded">wallet_sendCalls</code>
        </p>

        {/* Token Info Card */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            {tokenContractData ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Contract:</span>
                  <AddressDisplay
                    address={tokenContractData.address}
                    chain={targetNetwork}
                    blockExplorerAddressLink={
                      targetNetwork.id === hardhat.id
                        ? `/blockexplorer/address/${tokenContractData.address}`
                        : undefined
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Symbol:</span>
                  <span className="badge badge-primary">{tokenSymbol ?? "..."}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Your Balance:</span>
                  <span className="font-mono text-lg">
                    {formatTokenBalance(tokenBalance)} {tokenSymbol}
                  </span>
                </div>
                {spenderAddress && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Current Allowance:</span>
                    <span className="font-mono">
                      {formatTokenBalance(currentAllowance)} {tokenSymbol}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="alert alert-warning">
                <span>BatchToken contract not found. Please run `yarn deploy` to deploy it.</span>
              </div>
            )}
          </div>
        </div>

        {/* Batch Transaction Form */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Batch: Approve + Transfer</h2>
            <p className="text-sm opacity-70">
              Both operations are sent as a single batch call via EIP-5792. The wallet processes them together instead
              of requiring two separate transaction confirmations.
            </p>

            <div className="divider">Call 1: Approve</div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Spender Address</span>
              </label>
              <AddressInput
                value={spenderAddress}
                onChange={setSpenderAddress}
                placeholder="Address to approve as spender"
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Approve Amount ({tokenSymbol ?? "tokens"})</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="Amount to approve"
                value={approveAmount}
                onChange={e => setApproveAmount(e.target.value)}
                min="0"
                step="any"
              />
            </div>

            <div className="divider">Call 2: Transfer</div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Recipient Address</span>
              </label>
              <AddressInput
                value={recipientAddress}
                onChange={setRecipientAddress}
                placeholder="Address to receive tokens"
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Transfer Amount ({tokenSymbol ?? "tokens"})</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="Amount to transfer"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
                min="0"
                step="any"
              />
            </div>

            <button
              className={`btn btn-primary w-full mt-4 ${isBatchPending ? "loading" : ""}`}
              onClick={handleBatchApproveAndTransfer}
              disabled={isBatchPending || !connectedAddress}
            >
              {isBatchPending ? <span className="loading loading-spinner loading-sm"></span> : "Send Batch Transaction"}
            </button>

            {!connectedAddress && (
              <p className="text-sm text-center mt-2 opacity-70">Connect your wallet to send batch transactions.</p>
            )}
          </div>
        </div>

        {/* Transaction Status */}
        {batchCallsId && (
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Batch Status</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Batch ID:</span>
                  <code className="bg-base-300 px-2 py-1 rounded text-sm break-all">{batchCallsId.id}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <span className={`badge ${getStatusBadgeClass(callsStatus?.status)}`}>
                    {callsStatus?.status ?? "pending"}
                  </span>
                </div>
                {callsStatus?.receipts && callsStatus.receipts.length > 0 && (
                  <div>
                    <span className="font-medium">Transaction Receipts:</span>
                    <div className="mt-1 space-y-1">
                      {callsStatus.receipts.map((receipt, index) => (
                        <div key={index} className="bg-base-200 p-2 rounded text-sm">
                          <span className="font-mono break-all">
                            Tx {index + 1}: {receipt.transactionHash}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="card bg-base-100 shadow-xl mb-10">
          <div className="card-body">
            <h2 className="card-title">How It Works</h2>
            <div className="space-y-3 text-sm">
              <p>
                <strong>EIP-5792</strong> introduces <code className="bg-base-300 px-1 rounded">wallet_sendCalls</code>,
                allowing dApps to send multiple contract calls as a single batch request to the wallet.
              </p>
              <p>
                Instead of requiring the user to confirm two separate transactions (approve, then transfer), both
                operations are bundled and submitted together. Wallets that support EIP-5792 can execute them atomically
                or as a batch.
              </p>
              <p>
                This demo uses wagmi&apos;s <code className="bg-base-300 px-1 rounded">useSendCalls</code> hook along
                with viem&apos;s <code className="bg-base-300 px-1 rounded">encodeFunctionData</code> to construct and
                send the batch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchSend;
