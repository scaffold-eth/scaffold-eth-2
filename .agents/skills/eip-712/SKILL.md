---
name: eip-712
description: "Add EIP-712 typed structured data signing and verification to a Scaffold-ETH 2 project. Use when the user wants to: sign typed data, verify signatures, implement EIP-712, add off-chain signing, build a signature verification UI, or work with eth_signTypedData_v4."
---

# EIP-712 Typed Data Signing for Scaffold-ETH 2

## Prerequisites

Check if `./packages/nextjs/scaffold.config.ts` exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## Overview

[EIP-712](https://eips.ethereum.org/EIPS/eip-712) defines a standard for hashing and signing typed structured data in Ethereum. Instead of signing opaque hex blobs, wallets display human-readable fields (names, addresses, messages) so users can see exactly what they're signing — reducing phishing risk and user errors.

This skill covers integrating EIP-712 signing and verification (both frontend and backend) into an SE-2 project using [wagmi hooks](https://wagmi.sh/react/api/hooks/useSignTypedData) and [viem utilities](https://viem.sh/docs/actions/public/verifyTypedData). This skill focuses on SE-2 integration specifics and gotchas, not a complete reference. For anything not covered here, refer to the [EIP-712 specification](https://eips.ethereum.org/EIPS/eip-712) or the [wagmi](https://wagmi.sh/) / [viem](https://viem.sh/) docs.

## EIP-712 Concepts

### Domain separator

Every EIP-712 signature is scoped to a **domain** that prevents cross-application replay attacks. The domain object typically includes:

| Field | Type | Purpose |
|-------|------|---------|
| `name` | `string` | Human-readable app name |
| `version` | `string` | Signing schema version |
| `chainId` | `uint256` | Prevents cross-chain replay (optional but recommended) |
| `verifyingContract` | `address` | Ties signature to a specific contract (optional) |
| `salt` | `bytes32` | Extra disambiguation (rarely needed) |

**Only `name` and `version` are required.** Add `chainId` and `verifyingContract` when the signature will be verified on-chain — they prevent replay across chains or contracts. For purely off-chain verification, `name` + `version` is sufficient.

### Type definitions

EIP-712 types follow a specific format — an object where each key is a type name mapping to an array of `{ name, type }` field definitions:

```typescript
// Syntax reference — adapt types to your domain
const types = {
  Person: [
    { name: "name", type: "string" },
    { name: "wallet", type: "address" },
  ],
  Mail: [
    { name: "from", type: "Person" },
    { name: "to", type: "Person" },
    { name: "contents", type: "string" },
  ],
} as const;
```

Supported atomic types: `address`, `bool`, `string`, `bytes`, `bytesN` (1-32), `intN`, `uintN` (8-256 in steps of 8). Custom struct types (like `Person` above) are referenced by name. Arrays use `TypeName[]` syntax.

**The `primaryType` must match one of the top-level keys** in the types object — it tells the wallet which type is the root message being signed.

### Signing vs verification

| Operation | Where | Tool | Function |
|-----------|-------|------|----------|
| Sign typed data | Client (wallet) | wagmi | `useSignTypedData` → calls `eth_signTypedData_v4` |
| Verify (frontend) | Client (browser) | wagmi | `useVerifyTypedData` |
| Verify (backend) | Server (API route) | viem | `recoverTypedDataAddress` |
| Verify (on-chain) | Smart contract | Solidity | `ecrecover` with EIP-712 hash |

## EIP-712 Integration Pattern

### Utility module

Create a shared utility file for domain, types, and message generation. Both the page and API route import from here to stay in sync:

```typescript
// packages/nextjs/utils/eip-712.ts — adapt to your use case
import { Address, SignTypedDataReturnType } from "viem";

export const EIP_712_DOMAIN = {
  name: "My App",
  version: "1",
  // Add chainId / verifyingContract if doing on-chain verification
} as const;

export const EIP_712_TYPE = {
  // Define your struct types here
  Person: [
    { name: "name", type: "string" },
    { name: "wallet", type: "address" },
  ],
  Mail: [
    { name: "from", type: "Person" },
    { name: "to", type: "Person" },
    { name: "contents", type: "string" },
  ],
} as const;

// Helper to construct a typed message
export function generateMessage({
  fromName,
  fromAddress,
  toName,
  toAddress,
  contents,
}: {
  fromName: string;
  fromAddress?: string;
  toName: string;
  toAddress: string;
  contents: string;
}) {
  return {
    from: { name: fromName, wallet: fromAddress || "" },
    to: { name: toName, wallet: toAddress },
    contents,
  };
}

export type VerifyRequestBody = {
  fromName: string;
  message: string;
  signature: SignTypedDataReturnType;
  signer: Address;
};
```

**Key pattern:** The domain, types, and message construction must be identical on both signing and verification sides. Extract them into a shared module — mismatch is the #1 cause of verification failures.

### Signing typed data

Use wagmi's `useSignTypedData` hook. This calls `eth_signTypedData_v4` under the hood, which prompts the wallet to display the structured data for user review:

```tsx
import { useSignTypedData } from "wagmi";
import { useAccount } from "wagmi";
import { EIP_712_DOMAIN, EIP_712_TYPE, generateMessage } from "~~/utils/eip-712";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const { address } = useAccount();
const { signTypedDataAsync } = useSignTypedData();

const typedData = {
  domain: EIP_712_DOMAIN,
  types: EIP_712_TYPE,
  primaryType: "Mail" as const,
  message: generateMessage({ /* ... */ }),
};

try {
  const signature = await signTypedDataAsync(typedData);
  // signature is a hex string (0x...)
} catch (e) {
  notification.error(getParsedError(e));
}
```

### Frontend verification

Use wagmi's `useVerifyTypedData` hook to verify a signature client-side. It's reactive — pass the same typed data plus the signer's address and signature:

```tsx
import { useVerifyTypedData } from "wagmi";

const { data: isValid } = useVerifyTypedData({
  domain: EIP_712_DOMAIN,
  types: EIP_712_TYPE,
  primaryType: "Mail",
  message: generateMessage({ /* same params used during signing */ }),
  address: signerAddress,
  signature,
});
```

`isValid` is `true` if the signature matches the given address and typed data. **The typed data must be identical to what was signed** — any difference (even whitespace in strings) produces a different hash and verification fails.

### Backend verification (API route)

Use viem's `recoverTypedDataAddress` in a Next.js API route to verify server-side without trusting the client:

```typescript
// packages/nextjs/app/api/verify/route.ts
import { NextResponse } from "next/server";
import { recoverTypedDataAddress } from "viem";
import { EIP_712_DOMAIN, EIP_712_TYPE, VerifyRequestBody, generateMessage } from "~~/utils/eip-712";

export async function POST(req: Request) {
  try {
    const { fromName, message, signature, signer } = (await req.json()) as VerifyRequestBody;

    const recoveredAddress = await recoverTypedDataAddress({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPE,
      primaryType: "Mail",
      message: generateMessage({ fromName, fromAddress: signer, toName: "Bob", toAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB", contents: message }),
      signature,
    });

    if (recoveredAddress !== signer) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
    }

    return NextResponse.json({ message: "Verified" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Verification error" }, { status: 500 });
  }
}
```

## Gotchas and Pitfalls

**Domain/type mismatch between signing and verification.** This is the most common bug. If the domain, types, or message object differ even slightly between the signing call and the verification call, the EIP-712 hash changes and verification fails silently (returns a different address). Always import from the same shared utility module.

**`primaryType` must match a key in `types`.** If your types object has `{ Mail: [...], Person: [...] }`, then `primaryType` must be `"Mail"` or `"Person"`. A typo here causes a runtime error.

**Wallet support for `eth_signTypedData_v4`.** Most modern wallets (MetaMask, Coinbase Wallet, Rainbow, etc.) support v4. SE-2's burner wallet also supports it, so you can test locally without an external wallet. Older wallets may only support v3 (no array types, no nested structs).

**`as const` is critical for TypeScript.** Without `as const` on the domain and types objects, TypeScript widens string literals and wagmi/viem type inference breaks. You'll get confusing type errors about missing properties.

**`chainId` replay protection.** If you omit `chainId` from the domain, the same signature is valid on all chains. This is fine for off-chain-only use, but dangerous if the signature authorizes on-chain actions (e.g., permit signatures). Include `chainId` when signatures interact with contracts.

**Empty address handling.** When the wallet isn't connected, `address` is `undefined`. The utility function should handle this gracefully (e.g., default to empty string) rather than passing `undefined` into the typed data, which would cause a signing error.

**On-chain verification.** For verifying EIP-712 signatures in Solidity (e.g., meta-transactions, permits), use OpenZeppelin's `EIP712` base contract and `ECDSA.recover`. The domain separator must be constructed identically in both the contract and the frontend. This is a more advanced pattern — see the [OpenZeppelin EIP-712 docs](https://docs.openzeppelin.com/contracts/5.x/api/utils#EIP712).

## How to Test

1. Start the frontend: `yarn start`
2. Connect a wallet — the burner wallet, MetaMask, Coinbase Wallet all support `eth_signTypedData_v4`
3. Fill in the name and message fields, click Sign, review the typed data in the wallet popup
4. Verify on frontend (instant, client-side) or backend (API route call)
5. To test verification failure: change the name or message after signing, then verify — it should fail
