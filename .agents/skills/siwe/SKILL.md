---
name: siwe
description: "Add Sign-In with Ethereum (SIWE) authentication to a Scaffold-ETH 2 project. Use when the user wants to: add wallet-based login, implement SIWE, authenticate users with their Ethereum wallet, add session management with wallet signing, build sign-in with Ethereum, or add Web3 authentication."
---

# Sign-In with Ethereum (SIWE) for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Overview

[SIWE (EIP-4361)](https://eips.ethereum.org/EIPS/eip-4361) lets users authenticate by signing a structured message with their wallet. The flow:

1. Client asks the server for a **nonce** (stored in the session)
2. Client builds a SIWE message with that nonce and the user signs it
3. Server **verifies** the signature, domain and nonce, then marks the session as signed in
4. Session lives in an encrypted cookie ([iron-session](https://github.com/vvo/iron-session))

The code below is a minimal reference implementation; adapt file names, session fields and UI to the project.

## Use viem's Native SIWE — Not the `siwe` npm Package

Viem provides the SIWE utilities in `viem/siwe` (`createSiweMessage`, `parseSiweMessage`, `verifySiweMessage`, `generateSiweNonce`). Don't install the `siwe` npm package: it requires `ethers`, which SE-2 doesn't need since it already uses viem.

## Dependencies

```bash
yarn workspace @se-2/nextjs add iron-session
```

Add to `packages/nextjs/.env.local` (and the key, without value, to `.env.example`):

```env
# 32+ random characters, e.g. `openssl rand -base64 32`. Required in production.
IRON_SESSION_SECRET=
```

## Session Config

```typescript
// packages/nextjs/utils/siwe.ts
import { cookies } from "next/headers";
import { SessionOptions, getIronSession } from "iron-session";
import type { Address } from "viem";

export type SiweSessionData = {
  nonce?: string;
  address?: Address;
  chainId?: number;
  isLoggedIn: boolean;
};

// A function, not a module-level constant: env vars are then read at request time,
// so `next build` doesn't fail when IRON_SESSION_SECRET isn't set at build time.
function getSessionOptions(): SessionOptions {
  const secret = process.env.IRON_SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("IRON_SESSION_SECRET must be set in production (32+ chars)");
  }
  return {
    password: secret && secret.length >= 32 ? secret : "dev_only_password_at_least_32_characters_long",
    cookieName: "siwe-session",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    },
  };
}

export async function getSiweSession() {
  const session = await getIronSession<SiweSessionData>(await cookies(), getSessionOptions());
  session.isLoggedIn ??= false;
  return session;
}
```

## Verifying on the Right Chain (incl. Smart Wallets)

`verifySiweMessage` checks the signature with the client's `verifyHash`, which also supports smart contract wallets (ERC-1271, and ERC-6492 for not-yet-deployed ones like Coinbase Smart Wallet). That needs an RPC for the chain the user signed on, so build the client from SE-2's own network config instead of hardcoding a chain list:

```typescript
// packages/nextjs/services/siwe/publicClient.ts
import { createPublicClient, http } from "viem";
import scaffoldConfig from "~~/scaffold.config";
// Import from the file, not "~~/utils/scaffold-eth": the index also exports client-only UI helpers
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth/networks";

// Same RPC priority as the frontend (rpcOverrides → Alchemy → chain default), limited to targetNetworks
export function getSiwePublicClient(chainId: number) {
  const chain = scaffoldConfig.targetNetworks.find(c => c.id === chainId);
  if (!chain) return undefined;
  const rpcOverrides: Record<number, string> = scaffoldConfig.rpcOverrides ?? {};
  const rpcUrl = rpcOverrides[chainId] ?? getAlchemyHttpUrl(chainId);
  return createPublicClient({ chain, transport: http(rpcUrl) });
}
```

## API Routes

```typescript
// packages/nextjs/app/api/siwe/nonce/route.ts
import { NextResponse } from "next/server";
import { generateSiweNonce } from "viem/siwe";
import { getSiweSession } from "~~/utils/siwe";

export async function GET() {
  const session = await getSiweSession();
  session.nonce = generateSiweNonce();
  await session.save();
  return NextResponse.json({ nonce: session.nonce });
}
```

```typescript
// packages/nextjs/app/api/siwe/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { getSiwePublicClient } from "~~/services/siwe/publicClient";
import { getSiweSession } from "~~/utils/siwe";

export async function POST(req: NextRequest) {
  const { message, signature } = await req.json();
  const session = await getSiweSession();
  const nonce = session.nonce;

  // Nonces are single-use: clear it before verifying so a failed or replayed attempt can't reuse it
  session.nonce = undefined;
  await session.save();

  const domain = req.headers.get("host");
  const { address, chainId } = parseSiweMessage(message);
  if (!nonce || !domain || !address || !chainId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const client = getSiwePublicClient(chainId);
  if (!client) return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });

  // Checks signature, nonce, domain and the message's expirationTime/notBefore
  const isValid = await verifySiweMessage(client, { message, signature, nonce, domain });
  if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  session.address = address;
  session.chainId = chainId;
  session.isLoggedIn = true;
  await session.save();
  return NextResponse.json({ address });
}
```

```typescript
// packages/nextjs/app/api/siwe/session/route.ts
import { NextResponse } from "next/server";
import { getSiweSession } from "~~/utils/siwe";

export async function GET() {
  const { isLoggedIn, address, chainId } = await getSiweSession();
  return NextResponse.json({ isLoggedIn, address, chainId });
}

export async function DELETE() {
  const session = await getSiweSession();
  session.destroy();
  return NextResponse.json({ isLoggedIn: false });
}
```

To protect other routes or Server Components, call `getSiweSession()` and check `isLoggedIn` (and `address` for per-user data).

## Client Hook

```typescript
// packages/nextjs/hooks/useSiwe.ts
import { useCallback, useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import { createSiweMessage } from "viem/siwe";
import { useAccount, useSignMessage } from "wagmi";

type SiweState = { isLoggedIn: boolean; address?: Address };

export const useSiwe = () => {
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [state, setState] = useState<SiweState>({ isLoggedIn: false });
  const [isLoading, setIsLoading] = useState(false);

  // Bumped by signIn/signOut so a slow initial session fetch can't overwrite a newer state
  const stateVersion = useRef(0);

  useEffect(() => {
    const version = stateVersion.current;
    fetch("/api/siwe/session")
      .then(res => res.json())
      .then(session => {
        if (stateVersion.current === version) setState(session);
      });
  }, []);

  const signIn = useCallback(async () => {
    if (!address || !chainId) return;
    setIsLoading(true);
    try {
      const { nonce } = await fetch("/api/siwe/nonce").then(res => res.json());
      const message = createSiweMessage({
        domain: window.location.host, // must match the Host header the server sees
        address,
        statement: "Sign in with Ethereum to this app.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      stateVersion.current++;
      setState({ isLoggedIn: true, address });
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId, signMessageAsync]);

  const signOut = useCallback(async () => {
    await fetch("/api/siwe/session", { method: "DELETE" });
    stateVersion.current++;
    setState({ isLoggedIn: false });
  }, []);

  // On page load the wallet reconnects asynchronously, so `isConnected` is briefly false.
  // Only sign out once the wallet was connected and then actually disconnected (or switched accounts).
  const hasSeenWalletConnected = useRef(false);
  useEffect(() => {
    if (isConnected) hasSeenWalletConnected.current = true;
    if (!state.isLoggedIn || !hasSeenWalletConnected.current) return;
    if (!isConnected || (address && state.address && address.toLowerCase() !== state.address.toLowerCase())) {
      signOut();
    }
  }, [isConnected, address, state.isLoggedIn, state.address, signOut]);

  return { ...state, isLoading, signIn, signOut };
};
```

Show errors from `signIn` with `notification.error(getParsedError(e))` from `~~/utils/scaffold-eth` (a user rejecting the signature throws).

**Alternative:** RainbowKit (already in SE-2) has a built-in SIWE flow — [`RainbowKitAuthenticationProvider` + `createAuthenticationAdapter`](https://rainbowkit.com/docs/custom-authentication) — that prompts for the signature right after connecting. It calls the same nonce/verify/session routes; wire it in `components/ScaffoldEthAppWithProviders.tsx` if the user prefers that UX.

## Gotchas

**Always validate the domain.** Without the `domain` check in `verifySiweMessage`, a signature obtained by another site (phishing) can be replayed against yours. The example uses the request's `Host` header; behind a proxy that rewrites `Host`, compare against your configured public host instead (e.g. from an env var).

**Nonces must be single-use.** Generate them server-side and clear them from the session on every verify attempt. Otherwise a captured message + signature can be replayed until the session expires.

**Don't trust the message blindly.** `parseSiweMessage` returns partial data — check `address` and `chainId` exist, and only accept chains the app supports (here: `targetNetworks`). Use the address from the verified message, never one sent separately by the client.

**Smart wallets need a working RPC.** ERC-1271/6492 verification calls the chain. For the local chain (`hardhat` or `foundry`), `http()` falls back to `http://127.0.0.1:8545`, so `yarn chain` must be running.

**The session secret must be 32+ characters** (iron-session requirement) and must be set in production. Changing it logs everyone out.

## How to Test

1. Set `IRON_SESSION_SECRET` in `packages/nextjs/.env.local`
2. `yarn chain` and `yarn start`, connect a wallet (SE-2's burner wallet works on localhost), call `signIn` from a button using `useSiwe`
3. `GET /api/siwe/session` should return `{ isLoggedIn: true, address }`; refreshing the page should keep you signed in
4. Disconnect the wallet → the session should be cleared
5. Replaying the same `message` + `signature` to `/api/siwe/verify` should fail (nonce already used)
