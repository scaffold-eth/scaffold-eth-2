"use client";

import { useState } from "react";
import { Address as AddressDisplay, AddressInput, IntegerInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { encodeFunctionData, erc20Abi, formatEther, parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useCallsStatus, useSendCalls } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const BatchTransfer: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState<string | bigint>("");
  const [batchCallId, setBatchCallId] = useState<string | undefined>();

  const { data: batchTokenContract } = useDeployedContractInfo({ contractName: "BatchToken" });

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

  const { data: currentAllowance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "allowance",
    args: [connectedAddress, recipientAddress as `0x${string}`],
  });

  const { sendCallsAsync, isPending: isSendingBatch } = useSendCalls();

  const { data: callsStatus } = useCallsStatus({
    id: batchCallId as string,
    query: {
      enabled: !!batchCallId,
      refetchInterval: (data) => {
        if (data.state.data?.status === "CONFIRMED") return false;
        return 2000;
      },
    },
  });

  const handleBatchApproveAndTransfer = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    if (!batchTokenContract) {
      notification.error("BatchToken contract not found. Did you run `yarn deploy`?");
      return;
    }

    if (!recipientAddress) {
      notification.error("Please enter a recipient address");
      return;
    }

    const amount = typeof transferAmount === "string" ? transferAmount : transferAmount.toString();
    if (!amount || amount === "0") {
      notification.error("Please enter a valid transfer amount");
      return;
    }

    const parsedAmount = parseEther(amount);

    if (tokenBalance !== undefined && parsedAmount > tokenBalance) {
      notification.error("Insufficient token balance");
      return;
    }

    try {
      const approveCallData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [recipientAddress as `0x${string}`, parsedAmount],
      });

      const transferCallData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, parsedAmount],
      });

      notification.info("Sending batch transaction: approve + transfer");

      const result = await sendCallsAsync({
        calls: [
          {
            to: batchTokenContract.address,
            data: approveCallData,
          },
          {
            to: batchTokenContract.address,
            data: transferCallData,
          },
        ],
      });

      setBatchCallId(result.id);
      notification.success("Batch transaction submitted successfully!");
    } catch (e: unknown) {
      const error = e as Error;
      console.error("Batch transaction error:", error);
      notification.error(`Batch transaction failed: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">EIP-5792</span>
          <span className="block text-4xl font-bold">Batch Token Transfer</span>
        </h1>
        <p className="text-center text-lg mt-2">
          Approve and transfer ERC20 tokens in a single batch transaction using{" "}
          <code className="bg-base-300 text-base font-bold px-1 rounded">wallet_sendCalls</code>
        </p>

        {/* Token Info Card */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            {batchTokenContract ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{tokenName || "Loading..."}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Symbol:</span>
                  <span>{tokenSymbol || "Loading..."}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Contract:</span>
                  <AddressDisplay
                    address={batchTokenContract.address}
                    chain={targetNetwork}
                    blockExplorerAddressLink={
                      targetNetwork.id === hardhat.id
                        ? `/blockexplorer/address/${batchTokenContract.address}`
                        : undefined
                    }
                  />
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Your Balance:</span>
                  <span className="font-mono">
                    {tokenBalance !== undefined ? `${formatEther(tokenBalance)} ${tokenSymbol || ""}` : "Connect wallet"}
                  </span>
                </div>
                {recipientAddress && currentAllowance !== undefined && (
                  <div className="flex justify-between">
                    <span className="font-medium">Current Allowance:</span>
                    <span className="font-mono">
                      {formatEther(currentAllowance)} {tokenSymbol || ""}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="alert alert-warning">
                <span>BatchToken contract not deployed. Run <code>yarn deploy</code> first.</span>
              </div>
            )}
          </div>
        </div>

        {/* Batch Transfer Form */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Batch Approve & Transfer</h2>
            <p className="text-sm opacity-70">
              This sends two calls in a single batch: first approves the recipient for the specified amount, then
              transfers the tokens. Both operations happen atomically via EIP-5792.
            </p>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">Recipient Address</span>
              </label>
              <AddressInput
                value={recipientAddress}
                onChange={setRecipientAddress}
                placeholder="Enter recipient address"
              />
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">Amount ({tokenSymbol || "tokens"})</span>
              </label>
              <IntegerInput
                value={transferAmount}
                onChange={setTransferAmount}
                placeholder="Amount to approve and transfer"
                disableMultiplyBy1e18
              />
            </div>

            <div className="card-actions justify-center mt-6">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleBatchApproveAndTransfer}
                disabled={isSendingBatch || !connectedAddress || !batchTokenContract}
              >
                {isSendingBatch ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : null}
                {isSendingBatch ? "Sending Batch..." : "Batch Approve & Transfer"}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Status */}
        {batchCallId && (
          <div className="card bg-base-100 shadow-xl mt-6">
            <div className="card-body">
              <h2 className="card-title">Batch Transaction Status</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Batch ID:</span>
                  <span className="font-mono text-sm break-all">{batchCallId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`badge ${
                      callsStatus?.status === "CONFIRMED"
                        ? "badge-success"
                        : callsStatus?.status === "PENDING"
                          ? "badge-warning"
                          : "badge-info"
                    }`}
                  >
                    {callsStatus?.status || "SUBMITTED"}
                  </span>
                </div>
                {callsStatus?.receipts && callsStatus.receipts.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium">Transaction Receipts:</span>
                    <div className="mt-1 space-y-1">
                      {callsStatus.receipts.map((receipt, index) => (
                        <div key={index} className="bg-base-200 rounded p-2 text-sm font-mono break-all">
                          Tx {index + 1}: {receipt.transactionHash}
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
        <div className="card bg-base-100 shadow-xl mt-6 mb-10">
          <div className="card-body">
            <h2 className="card-title">How It Works</h2>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary badge-lg">1</div>
                <div>
                  <p className="font-medium">Approve (Call 1)</p>
                  <p className="text-sm opacity-70">
                    Calls <code className="bg-base-300 px-1 rounded">approve(recipient, amount)</code> on the ERC20
                    token contract, granting the recipient a spending allowance.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary badge-lg">2</div>
                <div>
                  <p className="font-medium">Transfer (Call 2)</p>
                  <p className="text-sm opacity-70">
                    Calls <code className="bg-base-300 px-1 rounded">transfer(recipient, amount)</code> to send the
                    tokens directly to the recipient.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="badge badge-secondary badge-lg">!</div>
                <div>
                  <p className="font-medium">Batched via EIP-5792</p>
                  <p className="text-sm opacity-70">
                    Both calls are sent as a single batch using <code className="bg-base-300 px-1 rounded">wallet_sendCalls</code>.
                    Compatible wallets execute them together, reducing the number of user confirmations to one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTransfer;
