---
name: eip-5792
description: "Add EIP-5792 batched transaction support to a Scaffold-ETH 2 project. Use when the user wants to: batch multiple contract calls, use wallet_sendCalls, add EIP-5792 wallet integration, batch onchain transactions, or use wagmi's experimental batch hooks."
---

# EIP-5792 Integration for Scaffold-ETH 2

## Prerequisites

This skill is designed for Scaffold-ETH 2 (SE-2) projects. If the user is **not already inside an SE-2 project**, use the `ethereum-app-builder` skill from this same skill package to scaffold one first, then come back here to add EIP-5792.

How to check: look for `packages/nextjs/` and either `packages/hardhat/` or `packages/foundry/` in the project root, along with a root `package.json` with SE-2 workspace scripts (`yarn chain`, `yarn deploy`, `yarn start`).

## Overview

[EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) (Wallet Call API) lets apps send batched onchain write calls to wallets via `wallet_sendCalls`, check their status with `wallet_getCallsStatus`, and query wallet capabilities with `wallet_getCapabilities`. This replaces the one-tx-at-a-time pattern of `eth_sendTransaction`.

This skill covers integrating EIP-5792 batched transactions into an SE-2 project using [wagmi's EIP-5792 hooks](https://wagmi.sh/react/api/hooks/useWriteContracts). For anything not covered here, refer to the [EIP-5792 docs](https://www.eip5792.xyz/) or [wagmi docs](https://wagmi.sh/). This skill focuses on SE-2 integration specifics and the wallet compatibility gotchas that trip people up.

## SE-2 Project Context

Scaffold-ETH 2 (SE-2) is a yarn (v3) monorepo for building dApps on Ethereum. It comes in two flavors based on the Solidity framework:

- **Hardhat flavor**: contracts at `packages/hardhat/contracts/`, deploy scripts at `packages/hardhat/deploy/`
- **Foundry flavor**: contracts at `packages/foundry/contracts/`, deploy scripts at `packages/foundry/script/`

Check which exists in the project to know the flavor. Both flavors share:

- **`packages/nextjs/`**: React frontend (Next.js App Router, Tailwind + DaisyUI, RainbowKit, Wagmi, Viem). Uses `~~` path alias for imports.
- **`packages/nextjs/contracts/deployedContracts.ts`**: auto-generated after `yarn deploy`, contains ABIs, addresses, and deployment block numbers for all contracts, keyed by chain ID.
- **`packages/nextjs/scaffold.config.ts`**: project config including `targetNetworks` (array of viem chain objects).
- **Root `package.json`**: monorepo scripts that proxy into workspaces (e.g. `yarn chain`, `yarn deploy`, `yarn start`).

The deployment scripts go alongside the existing deploy scripts, and the frontend page goes in the nextjs package. After deployment, `deployedContracts.ts` auto-generates the ABI and address, so the frontend can interact with contracts using SE-2's scaffold hooks (`useScaffoldReadContract`, `useScaffoldWriteContract`) for individual calls and wagmi's EIP-5792 hooks for batched calls.

Look at the actual project structure and contracts before setting things up. Adapt to what's there rather than following this skill rigidly.

## Dependencies

No new dependencies needed. SE-2 already includes wagmi, which has the EIP-5792 hooks. The experimental hooks live at `wagmi/experimental`:

- [`useWriteContracts`](https://wagmi.sh/react/api/hooks/useWriteContracts) — batch multiple contract calls into one wallet request
- [`useCapabilities`](https://wagmi.sh/react/api/hooks/useCapabilities) — detect what the connected wallet supports (batching, paymasters, etc.)
- [`useShowCallsStatus`](https://wagmi.sh/react/api/hooks/useShowCallsStatus) — ask the wallet to display status of a batch

> **Import paths are moving.** `useCapabilities` and `useShowCallsStatus` have been promoted to `wagmi` (stable). `useWriteContracts` is still in `wagmi/experimental` as of early 2026. Always check the [wagmi docs](https://wagmi.sh/) for the current import paths — they may have changed.

## Smart Contract

EIP-5792 works with any contract — there's nothing special about the contract side. The point is batching multiple calls (to one or more contracts) into a single wallet interaction. For a demo, a simple contract with two or more state-changing functions works well so users can see them batched:

```solidity
// Syntax reference — adapt to the user's actual needs
contract BatchExample {
    string public greeting = "Hello!";
    uint256 public counter = 0;

    function setGreeting(string memory _newGreeting) public payable {
        greeting = _newGreeting;
    }

    function incrementCounter() public {
        counter += 1;
    }

    receive() external payable {}
}
```

Deploy using the project's existing deployment pattern (Hardhat `deploy/` or Foundry `script/`).

## EIP-5792 Integration Pattern

### Detecting wallet support

Not all wallets support EIP-5792. Use `useCapabilities` to check before offering batch UI:

```tsx
import { useCapabilities } from "wagmi/experimental";
import { useAccount } from "wagmi";

const { address, chainId } = useAccount();
const { isSuccess: isEIP5792Wallet, data: walletCapabilities } = useCapabilities({ account: address });

// Check specific capabilities per chain
const isPaymasterSupported = walletCapabilities?.[chainId]?.paymasterService?.supported;
```

`isSuccess` being `true` means the wallet responded to `wallet_getCapabilities` — i.e., it's EIP-5792 compliant. The `data` object is keyed by chain ID, with each chain listing its supported capabilities.

### Batching contract calls

Use `useWriteContracts` to send multiple calls in one wallet interaction. You need the contract ABI and address — get these from SE-2's `useDeployedContractInfo` hook:

```tsx
import { useWriteContracts } from "wagmi/experimental";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const { data: deployedContract } = useDeployedContractInfo("YourContract");
const { writeContractsAsync, isPending } = useWriteContracts();

// Batch two calls
const result = await writeContractsAsync({
  contracts: [
    {
      address: deployedContract.address,
      abi: deployedContract.abi,
      functionName: "setGreeting",
      args: ["Hello from batch!"],
    },
    {
      address: deployedContract.address,
      abi: deployedContract.abi,
      functionName: "incrementCounter",
    },
  ],
  // Optional: add capabilities like paymaster
  capabilities: isPaymasterSupported ? {
    paymasterService: { url: paymasterURL }
  } : undefined,
});
```

The `result` contains an `id` that can be used to check status.

### Showing batch status

Use `useShowCallsStatus` to let the wallet display the status of a batch:

```tsx
import { useShowCallsStatus } from "wagmi/experimental";

const { showCallsStatusAsync } = useShowCallsStatus();
// After getting a batch ID from writeContractsAsync:
await showCallsStatusAsync({ id: batchId });
```

This opens the wallet's native UI for showing transaction status — the app doesn't need to build its own status tracker.

## Wallet Compatibility Gotchas

This is the main source of confusion with EIP-5792. Not all wallets behave the same way:

**SE-2's burner wallet supports EIP-5792 with sequential (non-atomic) calls.** It handles `wallet_sendCalls` by executing calls one at a time. However, advanced capabilities like paymasters and atomic execution aren't supported on the burner wallet or local chain. Test those features on a live testnet with a compliant wallet.

**Coinbase Wallet is the most complete implementation.** It supports batching, paymasters (via [ERC-7677](https://eips.ethereum.org/EIPS/eip-7677)), and atomic execution. [MetaMask has partial support](https://www.eip5792.xyz/ecosystem/wallets). Check the [EIP-5792 ecosystem page](https://www.eip5792.xyz/ecosystem/wallets) for the current list.

**Capabilities vary by chain.** A wallet might support paymasters on Base but not on Ethereum mainnet. Always check `walletCapabilities?.[chainId]` for the specific chain the user is on, not just whether the wallet is EIP-5792 compliant in general.

**Paymaster integration (ERC-7677) is optional.** If you want gas sponsorship, you need a paymaster service URL. This is passed as a `capability` in the `writeContracts` call. The paymaster service is external to SE-2 — you'll need to set one up (e.g., via [Coinbase Developer Platform](https://docs.cdp.coinbase.com/paymaster/docs/welcome) or other providers).

**Graceful degradation is important.** The UI should work for both EIP-5792 and non-EIP-5792 wallets. Use SE-2's standard `useScaffoldWriteContract` for individual calls as a fallback, and only show the batch button when `useCapabilities` succeeds. Consider offering a "switch to Coinbase Wallet" prompt when the connected wallet doesn't support EIP-5792.

## SE-2 Integration

### Header navigation

Add a tab to the SE-2 header menu for the EIP-5792 demo page. Pick an appropriate icon from `@heroicons/react/24/outline`.

### Frontend page

Build a page that demonstrates both individual and batched contract interactions. The key UX pattern:

1. **Read state** — use `useScaffoldReadContract` to show current contract values (these update after transactions)
2. **Individual writes** — use `useScaffoldWriteContract` for single calls (works with any wallet)
3. **Batched writes** — use `useWriteContracts` for the EIP-5792 batch (only enabled when wallet supports it)
4. **Status display** — use `useShowCallsStatus` to show batch result
5. **Wallet detection** — conditionally show/disable batch UI based on `useCapabilities`

Use SE-2's `notification` utility (`~~/utils/scaffold-eth`) for success/error feedback and `getParsedError` for readable error messages. SE-2 uses `@scaffold-ui/components` for blockchain components and DaisyUI + Tailwind for general styling.

## Development

1. Deploy the contract: `yarn deploy`
2. Start the frontend: `yarn start`
3. For basic batching: use any wallet on localhost
4. For advanced capabilities (paymasters, atomic execution): deploy to a live testnet and connect with an [EIP-5792 compliant wallet](https://www.eip5792.xyz/ecosystem/wallets)
