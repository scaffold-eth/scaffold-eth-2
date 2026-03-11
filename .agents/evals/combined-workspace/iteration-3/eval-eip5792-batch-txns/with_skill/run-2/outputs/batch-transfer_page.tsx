"use client";

import { useState } from "react";
import { Address, AddressInput } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const BatchTransfer: NextPage = () => {
  const { address: connectedAddress, chainId } = useAccount();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [isBatchPending, setIsBatchPending] = useState(false);

  // Check EIP-5792 wallet capabilities
  const { isSuccess: isEIP5792Wallet, data: walletCapabilities } = useCapabilities({
    account: connectedAddress,
  });

  // Get deployed contract info for useWriteContracts (EIP-5792)
  const { data: batchTokenContract } = useDeployedContractInfo({ contractName: "BatchToken" });

  // Read token state
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

  // EIP-5792 batch write hook
  const { writeContractsAsync } = useWriteContracts();

  const decimals = tokenDecimals ?? 18;

  const formattedBalance = userBalance !== undefined ? formatUnits(userBalance, decimals) : "0";
  const formattedAllowance =
    currentAllowance !== undefined && recipientAddress ? formatUnits(currentAllowance, decimals) : "0";

  const handleMint = async () => {
    if (!mintAmount) {
      notification.error("Please enter an amount to mint");
      return;
    }
    try {
      await writeBatchToken({
        functionName: "mint",
        args: [connectedAddress, parseUnits(mintAmount, decimals)],
      });
      notification.success(`Minted ${mintAmount} ${tokenSymbol} tokens!`);
      setMintAmount("");
    } catch (e) {
      console.error("Mint error:", e);
    }
  };

  const handleIndividualApprove = async () => {
    if (!recipientAddress || !transferAmount) {
      notification.error("Please fill in recipient and amount");
      return;
    }
    try {
      await writeBatchToken({
        functionName: "approve",
        args: [recipientAddress as `0x${string}`, parseUnits(transferAmount, decimals)],
      });
      notification.success("Approval granted!");
    } catch (e) {
      console.error("Approve error:", e);
    }
  };

  const handleIndividualTransfer = async () => {
    if (!recipientAddress || !transferAmount) {
      notification.error("Please fill in recipient and amount");
      return;
    }
    try {
      await writeBatchToken({
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, parseUnits(transferAmount, decimals)],
      });
      notification.success(`Transferred ${transferAmount} ${tokenSymbol}!`);
    } catch (e) {
      console.error("Transfer error:", e);
    }
  };

  const handleBatchApproveAndTransfer = async () => {
    if (!recipientAddress || !transferAmount) {
      notification.error("Please fill in recipient and amount");
      return;
    }
    if (!batchTokenContract) {
      notification.error("Contract not deployed. Run `yarn deploy` first.");
      return;
    }

    try {
      setIsBatchPending(true);
      const amountInWei = parseUnits(transferAmount, decimals);

      await writeContractsAsync({
        contracts: [
          {
            address: batchTokenContract.address,
            abi: batchTokenContract.abi,
            functionName: "approve",
            args: [recipientAddress as `0x${string}`, amountInWei],
          },
          {
            address: batchTokenContract.address,
            abi: batchTokenContract.abi,
            functionName: "transfer",
            args: [recipientAddress as `0x${string}`, amountInWei],
          },
        ],
      });

      notification.success(`Batch approve + transfer of ${transferAmount} ${tokenSymbol} sent!`);
      setTransferAmount("");
    } catch (e: any) {
      console.error("Batch transaction error:", e);
      notification.error("Batch transaction failed");
    } finally {
      setIsBatchPending(false);
    }
  };

  // Check if batching is supported for this chain
  const isBatchingSupported = isEIP5792Wallet && chainId && walletCapabilities?.[chainId];

  return (
    <div className="flex items-center flex-col grow pt-10 px-4">
      <h1 className="text-center">
        <span className="block text-4xl font-bold">EIP-5792 Batch Transfer</span>
        <span className="block text-lg mt-2">Approve + Transfer tokens in a single batch transaction</span>
      </h1>

      {/* Token Info Card */}
      <div className="card bg-base-100 shadow-xl w-full max-w-2xl mt-8">
        <div className="card-body">
          <h2 className="card-title">
            Token Info: {tokenName} ({tokenSymbol})
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Your Balance:</span>
              <span className="text-lg font-bold">
                {formattedBalance} {tokenSymbol}
              </span>
            </div>
            {connectedAddress && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Your Address:</span>
                <Address address={connectedAddress} />
              </div>
            )}
            {batchTokenContract && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Token Contract:</span>
                <Address address={batchTokenContract.address} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Capability Detection */}
      <div className="card bg-base-100 shadow-xl w-full max-w-2xl mt-4">
        <div className="card-body">
          <h2 className="card-title">Wallet EIP-5792 Support</h2>
          <div className="flex items-center gap-2">
            {isBatchingSupported ? (
              <>
                <div className="badge badge-success">Supported</div>
                <span className="text-sm">Your wallet supports EIP-5792 batch transactions</span>
              </>
            ) : (
              <>
                <div className="badge badge-warning">Not Detected</div>
                <span className="text-sm">
                  Your wallet may not support EIP-5792. You can still use individual transactions below. SE-2&apos;s
                  burner wallet supports basic batching on localhost.
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mint Section */}
      <div className="card bg-base-100 shadow-xl w-full max-w-2xl mt-4">
        <div className="card-body">
          <h2 className="card-title">Mint Tokens</h2>
          <p className="text-sm opacity-70">Get some tokens to test batch transfers</p>
          <div className="flex gap-4 items-end">
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text">Amount</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                className="input input-bordered w-full"
                value={mintAmount}
                onChange={e => setMintAmount(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary" onClick={handleMint} disabled={isWritePending || !mintAmount}>
              {isWritePending ? <span className="loading loading-spinner loading-sm"></span> : "Mint"}
            </button>
          </div>
        </div>
      </div>

      {/* Transfer Setup */}
      <div className="card bg-base-100 shadow-xl w-full max-w-2xl mt-4">
        <div className="card-body">
          <h2 className="card-title">Transfer Setup</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Recipient Address</span>
            </label>
            <AddressInput value={recipientAddress} onChange={setRecipientAddress} placeholder="0x..." />
          </div>
          <div className="form-control mt-2">
            <label className="label">
              <span className="label-text">Amount ({tokenSymbol})</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 50"
              className="input input-bordered w-full"
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
            />
          </div>
          {recipientAddress && (
            <div className="mt-2 text-sm opacity-70">
              Current allowance for recipient: {formattedAllowance} {tokenSymbol}
            </div>
          )}
        </div>
      </div>

      {/* Batch Transaction (EIP-5792) */}
      <div className="card bg-base-100 shadow-xl w-full max-w-2xl mt-4 border-2 border-primary">
        <div className="card-body">
          <h2 className="card-title">
            Batch: Approve + Transfer
            <div className="badge badge-primary">EIP-5792</div>
          </h2>
          <p className="text-sm opacity-70">
            Send both approve and transfer in a single wallet interaction using <code>wallet_sendCalls</code>. This
            saves time and reduces the number of wallet confirmations from two to one.
          </p>
          <button
            className="btn btn-primary mt-2"
            onClick={handleBatchApproveAndTransfer}
            disabled={isBatchPending || !recipientAddress || !transferAmount}
          >
            {isBatchPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Sending Batch...
              </>
            ) : (
              `Batch Approve + Transfer ${transferAmount || "0"} ${tokenSymbol || "BATCH"}`
            )}
          </button>
          {!isBatchingSupported && (
            <p className="text-xs mt-2 opacity-50">
              Note: Your wallet may execute these as sequential transactions rather than a true atomic batch.
            </p>
          )}
        </div>
      </div>

      {/* Individual Transactions (Fallback) */}
      <div className="card bg-base-100 shadow-xl w-full max-w-2xl mt-4 mb-10">
        <div className="card-body">
          <h2 className="card-title">Individual Transactions (Fallback)</h2>
          <p className="text-sm opacity-70">
            Use these if your wallet doesn&apos;t support EIP-5792, or to perform approve and transfer separately.
          </p>
          <div className="flex gap-4 mt-2">
            <button
              className="btn btn-outline btn-secondary flex-1"
              onClick={handleIndividualApprove}
              disabled={isWritePending || !recipientAddress || !transferAmount}
            >
              {isWritePending ? <span className="loading loading-spinner loading-sm"></span> : "1. Approve"}
            </button>
            <button
              className="btn btn-outline btn-accent flex-1"
              onClick={handleIndividualTransfer}
              disabled={isWritePending || !recipientAddress || !transferAmount}
            >
              {isWritePending ? <span className="loading loading-spinner loading-sm"></span> : "2. Transfer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTransfer;
