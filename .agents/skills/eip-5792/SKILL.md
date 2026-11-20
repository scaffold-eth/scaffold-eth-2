---
name: eip-5792
description: "Add EIP-5792 batched transaction support to a Scaffold-ETH 2 project. Use when the user wants to: batch multiple contract calls, use wallet_sendCalls, add EIP-5792 wallet integration, batch onchain transactions, or use wagmi's sendCalls / capabilities hooks."
---

# EIP-5792 Integration for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Overview

[EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) (Wallet Call API) lets apps send batched onchain write calls to wallets via `wallet_sendCalls`. No new dependencies needed — SE-2 already includes wagmi, which exposes the EIP-5792 hooks from `wagmi`:

- [`useSendCalls`](https://wagmi.sh/react/api/hooks/useSendCalls) — send multiple calls (including contract calls via `abi` + `functionName`) in one wallet request
- [`useWaitForCallsStatus`](https://wagmi.sh/react/api/hooks/useWaitForCallsStatus) — wait until a batch is confirmed and get its receipts
- [`useCapabilities`](https://wagmi.sh/react/api/hooks/useCapabilities) — detect what the connected wallet supports (atomic batching, paymasters, etc.)
- [`useShowCallsStatus`](https://wagmi.sh/react/api/hooks/useShowCallsStatus) — ask the wallet to display the status of a batch

> These hooks used to live in `wagmi/experimental`, and older examples still import them from there (along with the experimental `useWriteContracts`). Import from `wagmi` instead. Check the installed wagmi version and the [wagmi docs](https://wagmi.sh/) if an API looks different.

## Smart Contract

EIP-5792 works with any contract — the point is batching multiple calls into a single wallet interaction. Use the user's existing contracts. On a fresh SE-2 project, batching two `setGreeting` calls on `YourContract` is enough for a demo.

Deploy using the project's existing deployment pattern (Hardhat `deploy/` or Foundry `script/`).

## EIP-5792 Integration Pattern

### Detecting wallet support

Not all wallets support EIP-5792. Use `useCapabilities` to check before offering batch UI:

```tsx
import { useAccount, useCapabilities } from "wagmi";

const { address, chainId } = useAccount();
const { isSuccess: isEIP5792Wallet, data: walletCapabilities } = useCapabilities({ account: address });

// Capabilities are reported per chain
const isPaymasterSupported = chainId ? walletCapabilities?.[chainId]?.paymasterService?.supported : false;
```

`isSuccess` being `true` means the wallet responded to `wallet_getCapabilities` — i.e., it's EIP-5792 compliant.

### Batching contract calls

Use `useSendCalls` to send multiple calls in one wallet interaction. Get the contract ABI and address from SE-2's `useDeployedContractInfo` hook:

```tsx
import { useSendCalls, useWaitForCallsStatus } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const { data: deployedContract } = useDeployedContractInfo({ contractName: "YourContract" });
const { sendCallsAsync, data: batch, isPending } = useSendCalls();
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
  // Optional: only if the wallet reports paymasterService support for this chain.
  // paymasterURL comes from an external ERC-7677 paymaster provider (e.g. an env var).
  capabilities: isPaymasterSupported ? { paymasterService: { url: paymasterURL } } : undefined,
});
```

`callsStatus.status` becomes `"success"` once the batch is included; `callsStatus.receipts` holds the receipts.

### Showing batch status in the wallet

```tsx
import { useShowCallsStatus } from "wagmi";

const { showCallsStatusAsync } = useShowCallsStatus();
await showCallsStatusAsync({ id });
```

## Wallet Compatibility & Graceful Fallback

**Graceful degradation is critical.** The UI must work for both EIP-5792 and non-EIP-5792 wallets. Two options:
- Only show/enable the batch button when `useCapabilities` succeeds (`isEIP5792Wallet`), and use SE-2's `useScaffoldWriteContract` for individual calls otherwise
- Or pass `experimental_fallback: true` to `sendCallsAsync`: if the wallet doesn't support `wallet_sendCalls`, viem sends one `eth_sendTransaction` per call instead. It refuses to fall back (throws) when combined with `forceAtomic: true` or with a non-optional capability — mark capabilities like `paymasterService` as `optional: true` if the batch should still go through without them

**Capabilities vary by chain.** Always check `walletCapabilities?.[chainId]` for the specific chain, not just whether the wallet is EIP-5792 compliant in general.

**Atomicity is not guaranteed by default.** A wallet may execute the calls sequentially (non-atomic). If the batch must be all-or-nothing, pass `forceAtomic: true` to `sendCalls` and check `walletCapabilities?.[chainId]?.atomic?.status` first (`"supported"`, `"ready"` = can be upgraded on request, or `"unsupported"`). A wallet that can't guarantee atomicity rejects the request (SE-2's burner wallet does so even for a single call); the error's `shortMessage` is a generic "unknown RPC error", so show it to the user with `getParsedError` from `~~/utils/scaffold-eth`, which surfaces the wallet's actual reason.

**SE-2's burner wallet supports EIP-5792** with sequential (non-atomic) calls, so basic batching works on localhost. Advanced capabilities like paymasters require a live testnet and a wallet that implements them — see the [wallet support list](https://www.eip5792.xyz/ecosystem/wallets).

**Paymaster integration (ERC-7677) is optional.** For gas sponsorship you need a paymaster service URL passed as a `capability` in the `sendCalls` call. The paymaster service is external to SE-2.

## How to Test

1. Deploy the contract: `yarn deploy`
2. Start the frontend: `yarn start`
3. For basic batching: use any wallet on localhost (SE-2's burner wallet works)
4. For advanced capabilities (paymasters, atomic execution): deploy to a live testnet and connect with an [EIP-5792 compliant wallet](https://www.eip5792.xyz/ecosystem/wallets)
