---
name: siwe
description: "Use when the user wants wallet sign-in (SIWE, EIP-4361), or a server session tied to a wallet address."
---

# Sign-In with Ethereum (SIWE) for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Overview

[SIWE (EIP-4361)](https://eips.ethereum.org/EIPS/eip-4361): the user signs a message containing a server-issued nonce, the server verifies it and keeps the session in an encrypted cookie ([iron-session](https://github.com/vvo/iron-session)).

Use viem's SIWE utilities from `viem/siwe` (`createSiweMessage`, `parseSiweMessage`, `verifySiweMessage`, `generateSiweNonce`). The `siwe` npm package pulls in `ethers`, which SE-2 doesn't use.

Only the parts where a mistake fails silently are shown in full; write the rest to fit the project.

## Dependencies

```bash
yarn workspace @se-2/nextjs add iron-session
```

Add to `packages/nextjs/.env.local` (and the key, without value, to `.env.example`):

```env
# 32+ random characters, e.g. `openssl rand -base64 32`. Required in production; changing it logs everyone out.
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

To protect other routes or Server Components, call `getSiweSession()` and check `isLoggedIn` (and `address` for per-user data).

## Verifying on the Right Chain (incl. Smart Wallets)

`verifySiweMessage` checks the signature with the client's `verifyHash`, which also supports smart contract wallets (ERC-1271, and ERC-6492 for not-yet-deployed ones like Coinbase Smart Wallet). That calls the chain the user signed on, so build the client from SE-2's network config, limited to `targetNetworks`:

```typescript
// packages/nextjs/services/siwe/publicClient.ts
import { createPublicClient, http } from "viem";
import scaffoldConfig from "~~/scaffold.config";
// Import from the file, not "~~/utils/scaffold-eth": the index also exports client-only UI helpers
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth/networks";

// rpcOverrides, then Alchemy, then the chain's default RPC (first one set, no fallback).
// On the local chain that default is http://127.0.0.1:8545, so `yarn chain` must be running.
export function getSiwePublicClient(chainId: number) {
  const chain = scaffoldConfig.targetNetworks.find(c => c.id === chainId);
  if (!chain) return undefined;
  const rpcOverrides: Record<number, string> = scaffoldConfig.rpcOverrides ?? {};
  const rpcUrl = rpcOverrides[chainId] ?? getAlchemyHttpUrl(chainId);
  return createPublicClient({ chain, transport: http(rpcUrl) });
}
```

## API Routes

- `GET /api/siwe/nonce`: set `session.nonce = generateSiweNonce()`, save the session, return the nonce
- `POST /api/siwe/verify`: below
- `GET /api/siwe/session` returns `{ isLoggedIn, address, chainId }`; `DELETE` calls `session.destroy()`

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

  // Single-use per cookie: iron-session keeps the nonce in the cookie, so clearing it only changes
  // the cookie this response sets. An older copy still holds it until the message's expirationTime
  session.nonce = undefined;
  await session.save();

  // Behind a proxy that rewrites Host, compare against the configured public host instead (e.g. an env var)
  const domain = req.headers.get("host");
  // parseSiweMessage returns partial data: require the fields, and only accept target chains
  const { address, chainId } = parseSiweMessage(message);
  if (!nonce || !domain || !address || !chainId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const client = getSiwePublicClient(chainId);
  if (!client) return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });

  // Checks signature, nonce, domain (so signatures phished by another site are rejected) and expirationTime/notBefore
  const isValid = await verifySiweMessage(client, { message, signature, nonce, domain });
  if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  // Use the address from the verified message, never one sent separately by the client
  session.address = address;
  session.chainId = chainId;
  session.isLoggedIn = true;
  await session.save();
  return NextResponse.json({ address });
}
```

## Client Hook

A `useSiwe` hook (`packages/nextjs/hooks/useSiwe.ts`) loads the session on mount and exposes `signIn` / `signOut`. The non-obvious parts:

```typescript
// signIn
const { nonce } = await fetch("/api/siwe/nonce").then(res => res.json());
const message = createSiweMessage({
  domain: window.location.host, // must match the Host header the server checks
  address,
  chainId,
  nonce,
  uri: window.location.origin,
  version: "1",
  statement: "Sign in with Ethereum to this app.",
  expirationTime: new Date(Date.now() + 10 * 60 * 1000), // bounds replays with an older cookie
});
const signature = await signMessageAsync({ message }); // throws if the user rejects
const res = await fetch("/api/siwe/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message, signature }),
});
if (!res.ok) throw new Error((await res.json()).error);

// Sign out when the wallet disconnects or switches accounts. On page load the wallet reconnects
// asynchronously, so `isConnected` is briefly false: only act once it has been connected.
const hasSeenWalletConnected = useRef(false);
useEffect(() => {
  if (isConnected) hasSeenWalletConnected.current = true;
  if (!state.isLoggedIn || !hasSeenWalletConnected.current) return;
  if (!isConnected || (address && state.address && address.toLowerCase() !== state.address.toLowerCase())) {
    signOut();
  }
}, [isConnected, address, state.isLoggedIn, state.address, signOut]);
```

Ignore the mount-time session response once `signIn` or `signOut` has run (e.g. with a counter in a ref), or a slow fetch overwrites the newer state.

**Alternative:** RainbowKit (already in SE-2) has a built-in SIWE flow — [`RainbowKitAuthenticationProvider` + `createAuthenticationAdapter`](https://rainbowkit.com/docs/custom-authentication) — that prompts for the signature right after connecting. It calls the same nonce/verify/session routes; wire it in `components/ScaffoldEthAppWithProviders.tsx` if the user prefers that UX.

## Done When

With `yarn chain` and `yarn start` running and a wallet connected (SE-2's burner wallet works on localhost), run each check and report what you saw:

1. After `signIn`, `GET /api/siwe/session` returns `{ isLoggedIn: true, address }`, and still does after a page refresh
2. Disconnecting the wallet or switching accounts clears the session
3. Replaying the same `message` + `signature` to `/api/siwe/verify` with the cookie returned by the first verify is rejected
4. A message signed for a chain not in `targetNetworks` is rejected with `Unsupported chain`
5. `yarn next:build` passes without `IRON_SESSION_SECRET` set
