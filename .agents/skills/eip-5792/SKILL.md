---
name: eip-5792
description: "Add EIP-5792 batched transaction support to a Scaffold-ETH 2 project. Use when the user wants to: batch multiple contract calls, use wallet_sendCalls, add EIP-5792 wallet integration, batch onchain transactions, or use wagmi's experimental batch hooks."
---

# EIP-5792 Integration for Scaffold-ETH 2

## Prerequisites

Check if `./packages/nextjs/scaffold.config.ts` exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## Overview

[EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) (Wallet Call API) lets apps send batched onchain write calls to wallets via `wallet_sendCalls`. No new dependencies needed — SE-2 already includes wagmi, which has the EIP-5792 hooks at `wagmi/experimental`:

- [`useWriteContracts`](https://wagmi.sh/react/api/hooks/useWriteContracts) — batch multiple contract calls into one wallet request
- [`useCapabilities`](https://wagmi.sh/react/api/hooks/useCapabilities) — detect what the connected wallet supports (batching, paymasters, etc.)
- [`useShowCallsStatus`](https://wagmi.sh/react/api/hooks/useShowCallsStatus) — ask the wallet to display status of a batch

> **Import paths are moving.** `useCapabilities` and `useShowCallsStatus` have been promoted to `wagmi` (stable). `useWriteContracts` is still in `wagmi/experimental` as of early 2026. Always check the [wagmi docs](https://wagmi.sh/) for the current import paths.

## Smart Contract

EIP-5792 works with any contract — the point is batching multiple calls into a single wallet interaction. A simple contract with two or more state-changing functions works well for demonstrating batching:

```solidity
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

`isSuccess` being `true` means the wallet responded to `wallet_getCapabilities` — i.e., it's EIP-5792 compliant.

### Batching contract calls

Use `useWriteContracts` to send multiple calls in one wallet interaction. Get the contract ABI and address from SE-2's `useDeployedContractInfo` hook:

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
  // Optional: add paymaster capability if supported by the wallet
  capabilities: isPaymasterSupported ? {
    paymasterService: { url: paymasterURL }
  } : undefined,
});
```

### Showing batch status

```tsx
import { useShowCallsStatus } from "wagmi/experimental";

const { showCallsStatusAsync } = useShowCallsStatus();
await showCallsStatusAsync({ id: batchId });
```

## Wallet Compatibility & Graceful Fallback

**Graceful degradation is critical.** The UI must work for both EIP-5792 and non-EIP-5792 wallets:
- Use SE-2's `useScaffoldWriteContract` for individual calls as fallback
- Only show/enable the batch button when `useCapabilities` succeeds (`isEIP5792Wallet`)
- Consider a "switch to Coinbase Wallet" prompt for unsupported wallets

**Capabilities vary by chain.** Always check `walletCapabilities?.[chainId]` for the specific chain, not just whether the wallet is EIP-5792 compliant in general.

**SE-2's burner wallet supports EIP-5792** with sequential (non-atomic) calls. Advanced capabilities like paymasters require a live testnet with a compliant wallet (Coinbase Wallet has the most complete implementation).

**Paymaster integration (ERC-7677) is optional.** If you want gas sponsorship, you need a paymaster service URL passed as a `capability` in the `writeContracts` call. The paymaster service is external to SE-2.

## How to Test

1. Deploy the contract: `yarn deploy`
2. Start the frontend: `yarn start`
3. For basic batching: use any wallet on localhost (SE-2's burner wallet works)
4. For advanced capabilities (paymasters, atomic execution): deploy to a live testnet and connect with an [EIP-5792 compliant wallet](https://www.eip5792.xyz/ecosystem/wallets)
