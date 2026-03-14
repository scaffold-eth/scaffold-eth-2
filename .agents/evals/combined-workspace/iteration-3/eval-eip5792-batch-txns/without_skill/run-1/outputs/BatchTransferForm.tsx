"use client";

import { useState } from "react";
import { Address as AddressComp, AddressInput, IntegerInput } from "@scaffold-ui/components";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { useAccount, useSendCalls, useWaitForCallsStatus } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth/getParsedError";

const BatchTransferForm = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [batchCallsId, setBatchCallsId] = useState<string | undefined>(undefined);

  const { data: deployedContractData } = useDeployedContractInfo({ contractName: "BatchToken" });

  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true,
  });

  const { data: tokenDecimals } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "decimals",
  });

  const { data: tokenSymbol } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "symbol",
  });

  const { data: currentAllowance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "allowance",
    args: [connectedAddress, recipientAddress as `0x${string}`],
    watch: true,
  });

  const { sendCallsAsync, isPending: isSendingCalls } = useSendCalls();

  const { data: callsStatus, isLoading: isStatusLoading } = useWaitForCallsStatus({
    id: batchCallsId as string,
    query: {
      enabled: !!batchCallsId,
    },
  });

  const decimals = tokenDecimals ?? 18;
  const symbol = tokenSymbol ?? "BATCH";

  const formattedBalance = tokenBalance !== undefined ? (Number(tokenBalance) / 10 ** decimals).toLocaleString() : "0";

  const handleBatchApproveAndTransfer = async () => {
    if (!deployedContractData?.address) {
      notification.error("BatchToken contract not deployed. Run `yarn deploy` first.");
      return;
    }

    if (!connectedAddress) {
      notification.error("Please connect your wallet.");
      return;
    }

    if (!recipientAddress) {
      notification.error("Please enter a recipient address.");
      return;
    }

    if (!amount || amount === "0") {
      notification.error("Please enter a valid amount.");
      return;
    }

    const parsedAmount = parseUnits(amount, decimals);

    if (tokenBalance !== undefined && parsedAmount > tokenBalance) {
      notification.error("Insufficient token balance.");
      return;
    }

    const tokenAddress = deployedContractData.address;

    // Encode the approve call data
    const approveData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [recipientAddress as `0x${string}`, parsedAmount],
    });

    // Encode the transferFrom call data
    // After approve, the sender calls transferFrom(sender, recipient, amount)
    // Alternatively, we can just use transfer directly since we are the token holder.
    // Using approve + transferFrom pattern to demonstrate batching two distinct operations.
    const transferFromData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transferFrom",
      args: [connectedAddress, recipientAddress as `0x${string}`, parsedAmount],
    });

    try {
      const notificationId = notification.loading("Sending batch transaction...");

      const result = await sendCallsAsync({
        calls: [
          {
            to: tokenAddress,
            data: approveData,
          },
          {
            to: tokenAddress,
            data: transferFromData,
          },
        ],
      });

      notification.remove(notificationId);
      setBatchCallsId(result.id);
      notification.success("Batch transaction submitted!");
    } catch (e) {
      const parsedError = getParsedError(e);
      notification.error(parsedError);
    }
  };

  const isConfirmed = callsStatus?.status === "CONFIRMED";

  return (
    <div className="flex flex-col gap-6">
      {/* Token Info Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Your {symbol} Balance</h2>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">{formattedBalance}</span>
            <span className="text-lg opacity-70">{symbol}</span>
          </div>
          {connectedAddress && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm opacity-70">Wallet:</span>
              <AddressComp address={connectedAddress} chain={targetNetwork} />
            </div>
          )}
        </div>
      </div>

      {/* Batch Transfer Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Batch Approve & Transfer</h2>
          <p className="text-sm opacity-70 mb-4">
            This form demonstrates EIP-5792 batch transactions by combining an <code>approve</code> and{" "}
            <code>transferFrom</code> call into a single <code>wallet_sendCalls</code> request. Both operations execute
            atomically when supported by the wallet.
          </p>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Recipient Address</span>
            </label>
            <AddressInput
              value={recipientAddress}
              onChange={setRecipientAddress}
              placeholder="0x... or ENS name"
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text font-medium">Amount ({symbol})</span>
            </label>
            <IntegerInput
              value={amount}
              onChange={val => setAmount(val as string)}
              placeholder="0"
              disableMultiplyBy1e18
            />
          </div>

          {recipientAddress && currentAllowance !== undefined && (
            <div className="mt-2 text-sm opacity-70">
              Current allowance for recipient: {(Number(currentAllowance) / 10 ** decimals).toLocaleString()} {symbol}
            </div>
          )}

          <div className="mt-4 p-4 bg-base-200 rounded-lg">
            <h3 className="font-semibold mb-2">Batch Preview</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary badge-sm">1</span>
                <span>
                  <code>approve</code> — Allow {amount || "0"} {symbol} to be spent by recipient
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-primary badge-sm">2</span>
                <span>
                  <code>transferFrom</code> — Transfer {amount || "0"} {symbol} from you to recipient
                </span>
              </div>
            </div>
          </div>

          <div className="card-actions mt-6">
            <button
              className="btn btn-primary w-full"
              onClick={handleBatchApproveAndTransfer}
              disabled={isSendingCalls || !connectedAddress || !recipientAddress || !amount}
            >
              {isSendingCalls ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sending Batch Transaction...
                </>
              ) : (
                "Send Batch: Approve + Transfer"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      {batchCallsId && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Transaction Status</h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Batch ID:</span>
                <code className="text-sm bg-base-200 px-2 py-1 rounded break-all">{batchCallsId}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                {isStatusLoading ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : isConfirmed ? (
                  <span className="badge badge-success">Confirmed</span>
                ) : (
                  <span className="badge badge-warning">Pending</span>
                )}
              </div>
              {isConfirmed && callsStatus?.receipts && callsStatus.receipts.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">Transaction Receipts:</span>
                  <div className="flex flex-col gap-1 mt-1">
                    {callsStatus.receipts.map((receipt, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="badge badge-sm">{index + 1}</span>
                        <code className="bg-base-200 px-2 py-1 rounded break-all">
                          {receipt.transactionHash}
                        </code>
                        <span
                          className={`badge badge-sm ${receipt.status === "success" ? "badge-success" : "badge-error"}`}
                        >
                          {receipt.status}
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
    </div>
  );
};

export default BatchTransferForm;
