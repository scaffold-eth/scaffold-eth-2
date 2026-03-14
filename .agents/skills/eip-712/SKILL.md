---
name: eip-712
description: "Add EIP-712 typed structured data signing and verification to a Scaffold-ETH 2 project. Use when the user wants to: sign typed data, verify signatures, implement EIP-712, add off-chain signing, build a signature verification UI, or work with eth_signTypedData_v4."
---

# EIP-712 Typed Data Signing for Scaffold-ETH 2

## Prerequisites

Check if `./packages/nextjs/scaffold.config.ts` exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## Critical Pattern: Shared Utility Module

The single most important thing to get right is extracting EIP-712 domain, types, and message construction into a **shared utility module**. Both the frontend page and any API route or verification code must import from the same file. Domain/type mismatch between signing and verification is the #1 cause of verification failures — it fails silently (returns a different address).

```typescript
// packages/nextjs/utils/eip-712.ts — ALWAYS create this shared module
import { Address, SignTypedDataReturnType } from "viem";

// as const is CRITICAL — without it, TypeScript widens string literals
// and wagmi/viem type inference breaks with confusing type errors
export const EIP_712_DOMAIN = {
  name: "My App",
  version: "1",
  // Add chainId / verifyingContract when doing on-chain verification
} as const;

export const EIP_712_TYPES = {
  // Define your struct types here — adapt to your use case
  Vote: [
    { name: "voter", type: "address" },
    { name: "proposalId", type: "uint256" },
    { name: "support", type: "bool" },
  ],
} as const;

// Helper to construct typed messages
export function generateMessage(params: { voter: string; proposalId: bigint; support: boolean }) {
  return {
    voter: params.voter,
    proposalId: params.proposalId,
    support: params.support,
  };
}

export type VerifyRequestBody = {
  message: ReturnType<typeof generateMessage>;
  signature: SignTypedDataReturnType;
  signer: Address;
};
```

**Why `as const` matters**: Without it on both the domain and types objects, TypeScript widens `"My App"` to `string` and `"address"` to `string`. wagmi and viem hooks then can't infer the typed data structure, producing confusing errors about missing properties. This is a common pitfall.

## Gotchas

**`chainId` replay protection.** If you omit `chainId` from the domain, the same signature is valid on all chains. Include `chainId` and `verifyingContract` when signatures interact with contracts.

**On-chain verification.** Use OpenZeppelin's `EIP712` base contract and `ECDSA.recover`. The domain separator constructed in the contract must match the frontend exactly (same name, version, chainId, verifyingContract).

**Empty address handling.** When the wallet isn't connected, `address` is `undefined`. The utility function should handle this gracefully (e.g., default to empty string) rather than passing `undefined` into the typed data.
