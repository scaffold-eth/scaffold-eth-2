---
name: eip-5792
description: "Use when the user wants to batch several contract calls into one wallet request (EIP-5792 wallet_sendCalls), optionally atomic or gas-sponsored by a paymaster."
---

# EIP-5792 Integration for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Overview

[EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) (Wallet Call API) lets apps send several calls to the wallet in one `wallet_sendCalls` request. It works with any contract: batch calls to the project's existing contracts (on a fresh SE-2 project, two `setGreeting` calls on `YourContract`). wagmi, already in SE-2, provides the hooks, so no new dependencies are needed:

- [`useSendCalls`](https://wagmi.sh/react/api/hooks/useSendCalls) — send the batch (contract calls via `abi` + `functionName`)
- [`useWaitForCallsStatus`](https://wagmi.sh/react/api/hooks/useWaitForCallsStatus) — wait until it's confirmed and get the receipts
- [`useCapabilities`](https://wagmi.sh/react/api/hooks/useCapabilities) — what the connected wallet supports (atomic batching, paymasters, etc.)
- [`useShowCallsStatus`](https://wagmi.sh/react/api/hooks/useShowCallsStatus) — ask the wallet to display a batch's status (`showCallsStatusAsync({ id })`)

> These hooks used to live in `wagmi/experimental`, and older examples still import them from there (along with the experimental `useWriteContracts`). Import from `wagmi` instead.

## Detecting Wallet Support

```tsx
import { useAccount, useCapabilities } from "wagmi";

const { address, chainId } = useAccount();
// isSuccess: the wallet answered wallet_getCapabilities, i.e. it supports EIP-5792
const { isSuccess: isEIP5792Wallet, data: walletCapabilities } = useCapabilities({ account: address });

// Capabilities are reported per chain: check the connected one, not just EIP-5792 support in general
const isPaymasterSupported = chainId ? walletCapabilities?.[chainId]?.paymasterService?.supported : false;
```

## Batching Contract Calls

Get the ABI and address from SE-2's `useDeployedContractInfo`:

```tsx
import { useSendCalls, useWaitForCallsStatus } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const { data: deployedContract } = useDeployedContractInfo({ contractName: "YourContract" });
const { sendCallsAsync, data: batch, isPending } = useSendCalls();
// callsStatus.status becomes "success" once the batch is included; callsStatus.receipts holds the receipts
const { data: callsStatus, isLoading: isConfirming } = useWaitForCallsStatus({ id: batch?.id });

if (!deployedContract) return; // still loading, or not deployed on this chain

const { id } = await sendCallsAsync({
  calls: [
    {
      to: deployedContract.address,
      abi: deployedContract.abi,
      functionName: "setGreeting",
      args: ["Hello from batch!"],
    },
    {
      to: deployedContract.address,
      abi: deployedContract.abi,
      functionName: "setGreeting",
      args: ["Second call, same batch"],
    },
  ],
  // Optional gas sponsorship: only if the wallet reports paymasterService support for this chain.
  // paymasterURL comes from an external ERC-7677 paymaster provider (e.g. an env var).
  capabilities: isPaymasterSupported ? { paymasterService: { url: paymasterURL } } : undefined,
});
```

## Wallet Compatibility

**The UI must work with wallets that don't support EIP-5792.** Two options:
- Only show/enable the batch button when `useCapabilities` succeeds (`isEIP5792Wallet`), and use SE-2's `useScaffoldWriteContract` for individual calls otherwise
- Or pass `experimental_fallback: true` to `sendCallsAsync`: if the wallet doesn't support `wallet_sendCalls`, viem sends one `eth_sendTransaction` per call instead. It refuses to fall back (throws) when combined with `forceAtomic: true` or with a non-optional capability — mark capabilities like `paymasterService` as `optional: true` if the batch should still go through without them

**Atomicity is not guaranteed by default.** A wallet may execute the calls sequentially (non-atomic). If the batch must be all-or-nothing, pass `forceAtomic: true` to `sendCalls` and check `walletCapabilities?.[chainId]?.atomic?.status` first (`"supported"`, `"ready"` = can be upgraded on request, or `"unsupported"`). A wallet that can't guarantee atomicity rejects the request; the error's `shortMessage` is a generic "unknown RPC error", so show it with `getParsedError` from `~~/utils/scaffold-eth`, which surfaces the wallet's actual reason.

**SE-2's burner wallet supports EIP-5792** with sequential (non-atomic) calls, so basic batching works on localhost; it rejects `forceAtomic` even for a single call. Paymasters and atomic execution need a live testnet and a wallet that implements them — see the [wallet support list](https://www.eip5792.xyz/ecosystem/wallets).

## Done When

With `yarn chain`, `yarn deploy` and `yarn start` running, and SE-2's burner wallet connected, run each check and report what you saw:

1. The batch reaches `callsStatus.status === "success"`, and the contract state reflects every call (e.g. `greeting` holds the last call's value)
2. For a wallet without EIP-5792 support (`useCapabilities` not successful), the UI either hides the batch action and uses individual writes, or sends with `experimental_fallback: true`
3. If the batch uses `forceAtomic`, the burner wallet's rejection is shown to the user as a readable error
