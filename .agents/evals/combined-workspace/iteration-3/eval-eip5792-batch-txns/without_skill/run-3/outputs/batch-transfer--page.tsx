"use client";

import { useState } from "react";
import { Address as AddressComp, AddressInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { Abi, Address, encodeFunctionData, formatUnits, parseUnits } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useSendCalls } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const BatchTransfer: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");

  // Get deployed BatchToken contract info
  const { data: batchTokenContract } = useDeployedContractInfo({ contractName: "BatchToken" });

  // Read user's token balance
  const { data: tokenBalance, refetch: refetchBalance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "balanceOf",
    args: [connectedAddress],
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

  // Read current allowance the user has granted to themselves
  // (In batch: user approves themselves, then calls transferFrom as themselves)
  const { data: currentAllowance, refetch: refetchAllowance } = useScaffoldReadContract({
    contractName: "BatchToken",
    functionName: "allowance",
    args: [connectedAddress, connectedAddress],
  });

  // EIP-5792: useSendCalls for batching approve + transferFrom
  const {
    sendCallsAsync,
    data: sendCallsId,
    isPending: isSendCallsPending,
    isSuccess: isSendCallsSuccess,
    isError: isSendCallsError,
    error: sendCallsError,
  } = useSendCalls();

  const handleBatchTransfer = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    if (!recipientAddress) {
      notification.error("Please enter a recipient address");
      return;
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      notification.error("Please enter a valid amount");
      return;
    }

    if (!batchTokenContract) {
      notification.error("BatchToken contract not found. Did you run `yarn deploy`?");
      return;
    }

    const decimals = tokenDecimals ?? 18;
    const amountInWei = parseUnits(transferAmount, decimals);

    if (tokenBalance !== undefined && amountInWei > tokenBalance) {
      notification.error("Insufficient token balance");
      return;
    }

    const tokenAddress = batchTokenContract.address;
    const tokenAbi = batchTokenContract.abi as Abi;

    // Encode the approve call: approve the connected address to spend `amountInWei`
    const approveData = encodeFunctionData({
      abi: tokenAbi,
      functionName: "approve",
      args: [connectedAddress, amountInWei],
    });

    // Encode the transferFrom call: transferFrom connected address to recipient
    const transferFromData = encodeFunctionData({
      abi: tokenAbi,
      functionName: "transferFrom",
      args: [connectedAddress, recipientAddress as Address, amountInWei],
    });

    try {
      notification.info("Sending batch transaction via EIP-5792 (wallet_sendCalls)...");
      await sendCallsAsync({
        calls: [
          {
            to: tokenAddress,
            data: approveData,
            value: 0n,
          },
          {
            to: tokenAddress,
            data: transferFromData,
            value: 0n,
          },
        ],
      });
      notification.success("Batch transaction submitted successfully!");
      // Refetch balances after a short delay
      setTimeout(() => {
        refetchBalance();
        refetchAllowance();
      }, 2000);
    } catch (error: any) {
      console.error("Batch transaction failed:", error);
      notification.error(`Batch transaction failed: ${error?.message || "Unknown error"}`);
    }
  };

  const formattedBalance =
    tokenBalance !== undefined && tokenDecimals !== undefined ? formatUnits(tokenBalance, tokenDecimals) : "0";

  const formattedAllowance =
    currentAllowance !== undefined && tokenDecimals !== undefined ? formatUnits(currentAllowance, tokenDecimals) : "0";

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">EIP-5792</span>
          <span className="block text-4xl font-bold">Batch Token Transfer</span>
        </h1>
        <p className="text-center text-lg mt-2 text-base-content/70">
          Approve and transfer ERC20 tokens in a single batch transaction using{" "}
          <code className="bg-base-300 px-1 rounded text-sm">wallet_sendCalls</code>
        </p>

        {/* Connected Address */}
        <div className="flex justify-center items-center space-x-2 flex-col mt-6">
          <p className="font-medium">Connected Address:</p>
          <AddressComp
            address={connectedAddress}
            chain={targetNetwork}
            blockExplorerAddressLink={
              targetNetwork.id === hardhat.id ? `/blockexplorer/address/${connectedAddress}` : undefined
            }
          />
        </div>

        {/* Token Info Card */}
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Token Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/60">Symbol</p>
                <p className="font-bold text-lg">{tokenSymbol ?? "..."}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Decimals</p>
                <p className="font-bold text-lg">{tokenDecimals?.toString() ?? "..."}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Your Balance</p>
                <p className="font-bold text-lg">
                  {formattedBalance} {tokenSymbol ?? ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Self-Allowance</p>
                <p className="font-bold text-lg">
                  {formattedAllowance} {tokenSymbol ?? ""}
                </p>
              </div>
            </div>
            {batchTokenContract && (
              <div className="mt-2">
                <p className="text-sm text-base-content/60">Token Contract</p>
                <AddressComp
                  address={batchTokenContract.address}
                  chain={targetNetwork}
                  blockExplorerAddressLink={
                    targetNetwork.id === hardhat.id ? `/blockexplorer/address/${batchTokenContract.address}` : undefined
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Batch Transfer Form */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Batch Approve + Transfer</h2>
            <p className="text-sm text-base-content/60 mb-4">
              This sends two calls in a single batch via EIP-5792: first an{" "}
              <code className="bg-base-300 px-1 rounded text-xs">approve</code> call granting the connected wallet
              permission, then a <code className="bg-base-300 px-1 rounded text-xs">transferFrom</code> call moving
              tokens to the recipient. The wallet processes both atomically.
            </p>

            {/* Recipient Address */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Recipient Address</span>
              </label>
              <AddressInput value={recipientAddress} onChange={setRecipientAddress} placeholder="0x..." />
            </div>

            {/* Transfer Amount */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">Amount ({tokenSymbol ?? "tokens"})</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                className="input input-bordered w-full"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
                min="0"
                step="any"
              />
              {tokenBalance !== undefined && tokenDecimals !== undefined && (
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Max: {formattedBalance} {tokenSymbol}
                  </span>
                  <button
                    className="label-text-alt link link-primary"
                    onClick={() => setTransferAmount(formattedBalance)}
                  >
                    Use Max
                  </button>
                </label>
              )}
            </div>

            {/* Batch Preview */}
            <div className="bg-base-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-sm mb-2">Batch Preview (2 calls):</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="badge badge-primary badge-sm mt-0.5">1</span>
                  <div>
                    <p className="text-sm font-medium">approve()</p>
                    <p className="text-xs text-base-content/60">
                      Approve self to spend {transferAmount || "0"} {tokenSymbol ?? "tokens"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="badge badge-primary badge-sm mt-0.5">2</span>
                  <div>
                    <p className="text-sm font-medium">transferFrom()</p>
                    <p className="text-xs text-base-content/60">
                      Transfer {transferAmount || "0"} {tokenSymbol ?? "tokens"} to{" "}
                      {recipientAddress ? (
                        <span className="font-mono">
                          {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                        </span>
                      ) : (
                        "recipient"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className={`btn btn-primary mt-4 ${isSendCallsPending ? "loading" : ""}`}
              onClick={handleBatchTransfer}
              disabled={isSendCallsPending || !connectedAddress || !recipientAddress || !transferAmount}
            >
              {isSendCallsPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sending Batch...
                </>
              ) : (
                "Send Batch Transaction"
              )}
            </button>

            {/* Status */}
            {isSendCallsSuccess && sendCallsId && (
              <div className="alert alert-success mt-4">
                <div>
                  <p className="font-medium">Batch transaction submitted!</p>
                  <p className="text-sm font-mono break-all">Call Bundle ID: {sendCallsId.id}</p>
                </div>
              </div>
            )}
            {isSendCallsError && sendCallsError && (
              <div className="alert alert-error mt-4">
                <div>
                  <p className="font-medium">Batch transaction failed</p>
                  <p className="text-sm">{sendCallsError.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="card bg-base-100 shadow-xl mt-6 mb-10">
          <div className="card-body">
            <h2 className="card-title">How It Works</h2>
            <div className="space-y-3 text-sm">
              <div>
                <h3 className="font-semibold">EIP-5792: wallet_sendCalls</h3>
                <p className="text-base-content/70">
                  EIP-5792 introduces the <code className="bg-base-300 px-1 rounded text-xs">wallet_sendCalls</code> RPC
                  method that allows dApps to send multiple calls to a wallet in a single request. The wallet can then
                  execute these calls atomically (e.g., via account abstraction) or sequentially.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Why Batch Approve + Transfer?</h3>
                <p className="text-base-content/70">
                  Normally, transferring ERC20 tokens on behalf of a user requires two separate transactions: first{" "}
                  <code className="bg-base-300 px-1 rounded text-xs">approve()</code>, then{" "}
                  <code className="bg-base-300 px-1 rounded text-xs">transferFrom()</code>. With EIP-5792 batching, both
                  operations happen in a single user interaction, improving UX and saving time.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Wallet Support</h3>
                <p className="text-base-content/70">
                  EIP-5792 is supported by smart contract wallets and some modern EOA wallets. If your wallet does not
                  support batch calls, it may fall back to sending individual transactions or show an error.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTransfer;
