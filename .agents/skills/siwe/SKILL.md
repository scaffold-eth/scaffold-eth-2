---
name: siwe
description: "Add Sign-In with Ethereum (SIWE) authentication to a Scaffold-ETH 2 project. Use when the user wants to: add wallet-based login, implement SIWE, authenticate users with their Ethereum wallet, add session management with wallet signing, build sign-in with Ethereum, or add Web3 authentication."
---

# Sign-In with Ethereum (SIWE) for Scaffold-ETH 2

## Prerequisites

Check if `./packages/nextjs/scaffold.config.ts` exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## Overview

[Sign-In with Ethereum (SIWE / EIP-4361)](https://eips.ethereum.org/EIPS/eip-4361) lets users authenticate to web applications by signing a standardized message with their Ethereum wallet. Instead of username/password or OAuth, the user proves ownership of an address via a cryptographic signature. The server verifies it and creates a session — no database needed for basic auth.

This skill covers integrating SIWE into an SE-2 project using [viem's native SIWE utilities](https://viem.sh/docs/siwe/utilities/createSiweMessage) and [iron-session](https://github.com/vvo/iron-session) for encrypted cookie-based sessions. This skill focuses on SE-2 integration specifics and gotchas, not a complete reference. For anything not covered here, refer to the [EIP-4361 spec](https://eips.ethereum.org/EIPS/eip-4361) or [viem SIWE docs](https://viem.sh/docs/siwe/utilities/createSiweMessage).

## Dependencies

Add `iron-session` to the nextjs workspace for encrypted cookie-based session management:

```bash
yarn workspace @se-2/nextjs add iron-session
```

Everything else (viem, wagmi, RainbowKit) is already in SE-2. Viem provides all SIWE utilities natively — **do not install the `siwe` npm package**.

### Environment variables

Add to `packages/nextjs/.env.local`:

```
IRON_SESSION_SECRET=your_secret_key_at_least_32_characters_long
```

In development, the code can fall back to a hardcoded dev secret. **In production, this MUST be set** to a random 32+ character string. Generate one with:

```bash
openssl rand -base64 32
```

## SIWE Authentication Flow

The flow follows the standard EIP-4361 pattern with three API routes:

```
1. Client: GET /api/siwe/nonce        → Server generates random nonce, stores in session
2. Client: Create SIWE message         → Uses viem's createSiweMessage with nonce
3. Client: Wallet signs message         → signMessageAsync from wagmi
4. Client: POST /api/siwe/verify       → Server verifies signature + nonce + domain
5. Server: Creates authenticated session → Encrypted cookie via iron-session
6. Client: GET /api/siwe/session       → Check if session is active
7. Client: DELETE /api/siwe/session    → Logout (destroy session)
```

### Why nonce-first?

The nonce prevents replay attacks. The server generates a random nonce, stores it in the session cookie, and the client must include that exact nonce in the SIWE message. During verification, the server checks the nonce matches. After verification, the nonce is cleared so it can't be reused.

## Implementation

### Session configuration (`packages/nextjs/utils/siwe.ts`)

This is the core session setup. It configures iron-session and provides helper utilities:

```typescript
// packages/nextjs/utils/siwe.ts — adapt session options to your needs
import { SessionOptions } from "iron-session";

// Session data stored in the encrypted cookie
export type SiweSessionData = {
  nonce?: string;
  address?: string;
  chainId?: number;
  isLoggedIn: boolean;
  signedInAt?: string;
};

export const defaultSession: SiweSessionData = {
  isLoggedIn: false,
};

function getSessionPassword(): string {
  const secret = process.env.IRON_SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "IRON_SESSION_SECRET must be set in production (32+ chars)",
    );
  }
  // Dev-only fallback
  return "complex_password_at_least_32_characters_long_for_dev";
}

export const sessionOptions: SessionOptions = {
  password: getSessionPassword(),
  cookieName: "siwe-session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60, // 7 days — adapt as needed
  },
};

// Type guard for authenticated sessions
export function isAuthenticated(
  session: SiweSessionData,
): session is SiweSessionData & { address: string; chainId: number } {
  return session.isLoggedIn && !!session.address && !!session.chainId;
}
```

### SIWE config (`packages/nextjs/utils/siwe.config.ts`)

Separate config for tunable parameters:

```typescript
// packages/nextjs/utils/siwe.config.ts
const siweConfig = {
  sessionDurationDays: 7,
  messageExpirationMinutes: 10,
  statement: "Sign in with Ethereum to the app.",
} as const;

export default siweConfig;
export const { sessionDurationDays, messageExpirationMinutes, statement } =
  siweConfig;
```

### API Route: Nonce (`packages/nextjs/app/api/siwe/nonce/route.ts`)

Generates a cryptographic nonce and stores it in the session:

```typescript
// packages/nextjs/app/api/siwe/nonce/route.ts
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { generateSiweNonce } from "viem/siwe";
import { SiweSessionData, defaultSession, sessionOptions } from "~~/utils/siwe";

export async function GET() {
  try {
    const session = await getIronSession<SiweSessionData>(
      await cookies(),
      sessionOptions,
    );

    // Reset session and generate fresh nonce
    session.isLoggedIn = defaultSession.isLoggedIn;
    session.address = undefined;
    session.chainId = undefined;
    session.signedInAt = undefined;
    session.nonce = generateSiweNonce();
    await session.save();

    return NextResponse.json({ nonce: session.nonce });
  } catch (error) {
    console.error("Nonce generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate nonce" },
      { status: 500 },
    );
  }
}
```

### API Route: Verify (`packages/nextjs/app/api/siwe/verify/route.ts`)

The most complex route — validates the signed SIWE message:

```typescript
// packages/nextjs/app/api/siwe/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { type Chain, createPublicClient, http } from "viem";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  gnosis,
  scroll,
  zkSync,
  sepolia,
  hardhat,
} from "viem/chains";
import { SiweSessionData, sessionOptions } from "~~/utils/siwe";

// Add/remove chains your app supports — needed for ERC-6492 smart wallet verification
const SUPPORTED_CHAINS: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [polygon.id]: polygon,
  [optimism.id]: optimism,
  [arbitrum.id]: arbitrum,
  [base.id]: base,
  [gnosis.id]: gnosis,
  [scroll.id]: scroll,
  [zkSync.id]: zkSync,
  [sepolia.id]: sepolia,
  [hardhat.id]: hardhat,
};

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SiweSessionData>(
      await cookies(),
      sessionOptions,
    );
    const { message, signature } = await req.json();

    if (!message || !signature) {
      return NextResponse.json(
        { error: "Missing message or signature" },
        { status: 400 },
      );
    }

    const storedNonce = session.nonce;
    if (!storedNonce) {
      return NextResponse.json(
        { error: "No nonce found. Request /api/siwe/nonce first." },
        { status: 400 },
      );
    }

    const parsedMessage = parseSiweMessage(message);

    // SECURITY: Validate domain against Host header. In production behind a reverse proxy,
    // ensure Host is forwarded correctly, or replace with a hardcoded expected domain.
    const expectedDomain = req.headers.get("host");
    if (!expectedDomain) {
      return NextResponse.json(
        { error: "Missing Host header" },
        { status: 400 },
      );
    }

    // Create a client for the chain to support ERC-6492 (smart wallet) verification
    const chainId = parsedMessage.chainId;
    const chain = chainId ? SUPPORTED_CHAINS[chainId] : undefined;
    if (!chain) {
      return NextResponse.json(
        { error: `Unsupported chain: ${chainId}` },
        { status: 400 },
      );
    }

    const client = createPublicClient({ chain, transport: http() });
    const isValid = await verifySiweMessage(client, {
      message,
      signature,
      nonce: storedNonce,
      domain: expectedDomain,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 },
      );
    }

    // Create authenticated session
    session.isLoggedIn = true;
    session.address = parsedMessage.address;
    session.chainId = chainId;
    session.signedInAt = new Date().toISOString();
    session.nonce = undefined; // Clear nonce — one-time use
    await session.save();

    return NextResponse.json({
      ok: true,
      address: session.address,
      chainId: session.chainId,
    });
  } catch (error) {
    console.error("SIWE verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
```

### API Route: Session (`packages/nextjs/app/api/siwe/session/route.ts`)

Check and destroy sessions:

```typescript
// packages/nextjs/app/api/siwe/session/route.ts
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SiweSessionData, defaultSession, sessionOptions } from "~~/utils/siwe";

export async function GET() {
  const session = await getIronSession<SiweSessionData>(
    await cookies(),
    sessionOptions,
  );

  if (session.isLoggedIn) {
    return NextResponse.json({
      isLoggedIn: true,
      address: session.address,
      chainId: session.chainId,
      signedInAt: session.signedInAt,
    });
  }

  return NextResponse.json(defaultSession);
}

export async function DELETE() {
  const session = await getIronSession<SiweSessionData>(
    await cookies(),
    sessionOptions,
  );
  session.destroy();
  return NextResponse.json(defaultSession);
}
```

### Custom hook (`packages/nextjs/hooks/useSiwe.ts`)

The `useSiwe` hook encapsulates the entire auth flow:

```typescript
// packages/nextjs/hooks/useSiwe.ts — syntax reference, adapt to your needs
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { createSiweMessage } from "viem/siwe";
import { messageExpirationMinutes, statement } from "~~/utils/siwe.config";

type SiweState = {
  address: string | undefined;
  chainId: number | undefined;
  isSignedIn: boolean;
  isLoading: boolean;
  error: string | undefined;
  siweMessage: string | undefined;
  signedInAt: string | undefined;
};

export function useSiwe() {
  const { address: connectedAddress, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const hasSeenWalletConnected = useRef(false);

  const [state, setState] = useState<SiweState>({
    address: undefined,
    chainId: undefined,
    isSignedIn: false,
    isLoading: true,
    error: undefined,
    siweMessage: undefined,
    signedInAt: undefined,
  });

  // Check session on mount
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/siwe/session");
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        isSignedIn: data.isLoggedIn ?? false,
        address: data.address,
        chainId: data.chainId,
        signedInAt: data.signedInAt,
        isLoading: false,
      }));
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Auto-logout on wallet disconnect or address change
  useEffect(() => {
    if (isConnected) {
      hasSeenWalletConnected.current = true;
    }
    if (!isConnected && hasSeenWalletConnected.current && state.isSignedIn) {
      // Wallet disconnected after being connected — sign out
      fetch("/api/siwe/session", { method: "DELETE" }).then(() => {
        setState((prev) => ({
          ...prev,
          isSignedIn: false,
          address: undefined,
          chainId: undefined,
          siweMessage: undefined,
          signedInAt: undefined,
        }));
      });
    }
  }, [isConnected, state.isSignedIn]);

  const signIn = useCallback(async () => {
    if (!connectedAddress || !chainId) {
      setState((prev) => ({ ...prev, error: "Wallet not connected" }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
    try {
      // 1. Fetch nonce
      const nonceRes = await fetch("/api/siwe/nonce");
      const { nonce } = await nonceRes.json();

      // 2. Create SIWE message
      const now = new Date();
      const message = createSiweMessage({
        domain: window.location.host,
        address: connectedAddress,
        chainId,
        nonce,
        uri: window.location.origin,
        version: "1",
        statement,
        issuedAt: now,
        expirationTime: new Date(
          now.getTime() + messageExpirationMinutes * 60 * 1000,
        ),
      });

      // 3. Sign with wallet
      const signature = await signMessageAsync({ message });

      // 4. Verify on server
      const verifyRes = await fetch("/api/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || "Verification failed");
      }

      const result = await verifyRes.json();
      setState((prev) => ({
        ...prev,
        isSignedIn: true,
        address: result.address,
        chainId: result.chainId,
        siweMessage: message,
        signedInAt: new Date().toISOString(),
        isLoading: false,
      }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: e instanceof Error ? e.message : "Sign-in failed",
      }));
    }
  }, [connectedAddress, chainId, signMessageAsync]);

  const signOut = useCallback(async () => {
    await fetch("/api/siwe/session", { method: "DELETE" });
    setState((prev) => ({
      ...prev,
      isSignedIn: false,
      address: undefined,
      chainId: undefined,
      siweMessage: undefined,
      signedInAt: undefined,
      error: undefined,
    }));
  }, []);

  return {
    ...state,
    isWalletConnected: isConnected,
    connectedAddress,
    signIn,
    signOut,
    checkSession,
  };
}
```

**Key hook behaviors:**

- Checks session on mount so refreshing the page preserves auth state
- Auto-signs out when wallet disconnects or address changes
- Uses a `hasSeenWalletConnected` ref to avoid false auto-logout on initial page load (when wallet reconnects asynchronously)
- Separate `connectedAddress` (current wallet) vs `address` (authenticated session) — these can differ if the user switches wallets

## Gotchas and Pitfalls

**Nonce must be fetched fresh before each sign-in attempt.** The nonce is single-use and stored server-side. If the user cancels signing or the request fails, they need a new nonce. The `signIn` function handles this by always fetching a fresh nonce first.

**Domain validation is critical for security.** The verify route checks that the SIWE message's domain matches the `Host` header. In production behind a reverse proxy, ensure the `Host` header is forwarded correctly, or domain verification will fail.

**Message expiration window.** The SIWE message includes `expirationTime` (default: 10 minutes from creation). If the user takes too long to sign, verification fails. This is configurable in `siwe.config.ts`.

**ERC-6492 smart wallet support.** Viem's `verifySiweMessage` supports [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492) signatures automatically, meaning smart contract wallets (Safe, Argent, etc.) work out of the box. The verify route creates a public client for the signer's chain to enable on-chain verification of smart wallet signatures.

**`SUPPORTED_CHAINS` in the verify route must include all chains your app supports.** If a user signs from a chain not in the map, verification is rejected with a 400 error. Add any chains your SE-2 project targets.

**Auto-logout timing on wallet changes.** The hook watches `isConnected` and signs out when the wallet disconnects. But on page refresh, the wallet reconnects asynchronously, causing a brief `isConnected: false` state. The `hasSeenWalletConnected` ref prevents this from triggering a false logout.

**Session vs wallet address mismatch.** After signing in, a user could switch to a different wallet address without signing out. The hook exposes both `address` (session) and `connectedAddress` (current wallet) — compare them if you need to detect this mismatch and prompt re-authentication.

**iron-session cookie size limits.** Cookies are limited to ~4KB. The session data is small (address, chainId, timestamps), so this is rarely an issue, but don't try to store large payloads in the session.

**Server-side session checks.** To protect API routes or server components, use `getIronSession` with the same `sessionOptions` and check `session.isLoggedIn`. Don't rely on client-side checks alone for sensitive operations.

The hook returns these properties:

| Property            | Type                  | Description                                      |
| ------------------- | --------------------- | ------------------------------------------------ |
| `isSignedIn`        | `boolean`             | Whether user has an active SIWE session          |
| `address`           | `string \| undefined` | Authenticated wallet address                     |
| `chainId`           | `number \| undefined` | Chain ID from signed message                     |
| `signedInAt`        | `string \| undefined` | ISO timestamp of sign-in                         |
| `isLoading`         | `boolean`             | Loading state during sign-in/session check       |
| `error`             | `string \| undefined` | Error message from last operation                |
| `siweMessage`       | `string \| undefined` | The raw SIWE message that was signed             |
| `isWalletConnected` | `boolean`             | Whether any wallet is currently connected        |
| `connectedAddress`  | `string \| undefined` | Current wallet address (may differ from session) |
| `signIn`            | `() => Promise<void>` | Initiate SIWE sign-in flow                       |
| `signOut`           | `() => Promise<void>` | Destroy session and sign out                     |
| `checkSession`      | `() => Promise<void>` | Manually recheck session state                   |

## How to Test

1. Start the frontend: `yarn start`
2. Connect a wallet — MetaMask, Coinbase Wallet, and the burner wallet all support `personal_sign` which is what SIWE uses
3. Click "Sign In" — review the SIWE message in the wallet popup, confirm
4. The session persists across page refreshes (encrypted cookie)
5. Disconnect wallet or click "Sign Out" to end the session

## Production:

1. In production make sure to set `IRON_SESSION_SECRET` environment variable to a secure 32+ character random string
