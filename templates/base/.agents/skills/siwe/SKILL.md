---
name: siwe
description: "Add Sign-In with Ethereum (SIWE) authentication to a Scaffold-ETH 2 project. Use when the user wants to: add wallet-based login, implement SIWE, authenticate users with their Ethereum wallet, add session management with wallet signing, build sign-in with Ethereum, or add Web3 authentication."
---

# Sign-In with Ethereum (SIWE) for Scaffold-ETH 2

## Prerequisites

Check if `./packages/nextjs/scaffold.config.ts` exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## Critical: Use viem's Native SIWE — NOT the `siwe` npm Package

Viem provides all SIWE utilities natively via `viem/siwe`. **Do not install the `siwe` npm package**. It pulls in `ethers` as a peer dependency, which is unnecessary since SE-2 already uses viem.

Here are some commonly useful imports (but check official docs for any updates or alternatives):

```typescript
import {
  createSiweMessage,
  parseSiweMessage,
  verifySiweMessage,
  generateSiweNonce,
} from "viem/siwe";
```

## Dependencies

```bash
yarn workspace @se-2/nextjs add iron-session
```

## Gotchas

### 1. Domain Validation in the Verify Route

The verify route **must** validate the SIWE message's domain against the request's `Host` header. Without this, an attacker can replay a signature from a different domain. This is a critical security check that's easy to skip:

```typescript
// In your verify API route
const expectedDomain = req.headers.get("host");
if (!expectedDomain) {
  return NextResponse.json({ error: "Missing Host header" }, { status: 400 });
}

// Pass domain to verifySiweMessage
const isValid = await verifySiweMessage(client, {
  message,
  signature,
  nonce: storedNonce,
  domain: expectedDomain, // CRITICAL — validates domain match
});
```

### 2. Session Options Must Use a Lazy Getter

`sessionOptions` must NOT be a module-level constant that calls `getSessionPassword()` at import time. During `next build`, the code runs in production mode, and the env var won't be set, causing a build failure. Use a lazy factory:

```typescript
// packages/nextjs/utils/siwe.ts
import { SessionOptions } from "iron-session";

export type SiweSessionData = {
  nonce?: string;
  address?: string;
  chainId?: number;
  isLoggedIn: boolean;
  signedInAt?: string;
};

export const defaultSession: SiweSessionData = { isLoggedIn: false };

// Lazy getter — defers env var evaluation to request time
export function getSessionOptions(): SessionOptions {
  const secret = process.env.IRON_SESSION_SECRET;
  const password =
    secret && secret.length >= 32
      ? secret
      : process.env.NODE_ENV === "production"
        ? (() => {
            throw new Error(
              "IRON_SESSION_SECRET must be set in production (32+ chars)",
            );
          })()
        : "complex_password_at_least_32_characters_long_for_dev";

  return {
    password,
    cookieName: "siwe-session",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    },
  };
}
```

### 3. `hasSeenWalletConnected` Ref to Prevent False Auto-Logout

On page refresh, the wallet reconnects asynchronously, causing a brief `isConnected: false` state. Without tracking whether the wallet was ever connected, this triggers a false logout. Use a ref:

```typescript
const hasSeenWalletConnected = useRef(false);

useEffect(() => {
  if (isConnected) {
    hasSeenWalletConnected.current = true;
  }
  if (!isConnected && hasSeenWalletConnected.current && state.isSignedIn) {
    // Wallet actually disconnected — sign out
    fetch("/api/siwe/session", { method: "DELETE" }).then(() => {
      setState((prev) => ({ ...prev, isSignedIn: false, address: undefined }));
    });
  }
}, [isConnected, state.isSignedIn]);
```

## ERC-6492 Smart Wallet Support

The verify route should create a `publicClient` per chain to support smart contract wallet (Safe, Argent) signature verification. Maintain a `SUPPORTED_CHAINS` map and reject unknown chains:

```typescript
import { createPublicClient, http, type Chain } from "viem";
import { mainnet, sepolia, hardhat /* ... */ } from "viem/chains";

const SUPPORTED_CHAINS: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [sepolia.id]: sepolia,
  [hardhat.id]: hardhat,
};

// In verify route:
const chain = SUPPORTED_CHAINS[parsedMessage.chainId!];
if (!chain)
  return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
const client = createPublicClient({ chain, transport: http() });
```
