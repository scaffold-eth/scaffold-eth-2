---
name: x402
description: "Add x402 payment-gated routes to a Scaffold-ETH 2 project. Use when the user wants to: monetize an API with micropayments, add HTTP 402 payment required to routes, gate content behind crypto payments, implement pay-per-call APIs, or integrate the x402 protocol."
---

# x402 Payment Protocol Integration for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Overview

[x402](https://www.x402.org/) is an open payment protocol that uses HTTP status code 402 ("Payment Required") to enable instant stablecoin micropayments over HTTP. When a client requests a protected resource without payment, the server responds with 402 + payment instructions. The client signs a payment, retries the request, and gets access.

This skill covers integrating x402 v2 (`@x402/*` packages) into SE-2's Next.js app. For the full protocol spec and advanced usage, refer to the [x402 docs](https://docs.cdp.coinbase.com/x402/welcome) or the [GitHub repo](https://github.com/coinbase/x402) — the package READMEs there are the most up-to-date API reference. This skill focuses on SE-2 integration specifics and gotchas.

## Dependencies

### NextJS package

```bash
yarn workspace @se-2/nextjs add @x402/core @x402/evm @x402/next @x402/paywall
```

**Check the `next` peer dependency.** Recent `@x402/next` releases raise their minimum Next.js version (e.g. `>=16.4.1`). If yarn warns about an unmet `next` peer, either upgrade `next` in `packages/nextjs` or install a `@x402/*` version whose peer range matches the project's Next.js (`npm view @x402/next peerDependencies`). Keep all `@x402/*` packages on the same version.

### Environment variables

Add to `packages/nextjs/.env.local` (gitignored — SE-2's `.env.example` uses `.env.local` for local values):

```env
# Facilitator service URL — verifies and settles payments.
# https://x402.org/facilitator is the default testnet facilitator (no signup needed).
FACILITATOR_URL=https://x402.org/facilitator

# Address that receives payments (your deployer or any wallet)
RESOURCE_WALLET_ADDRESS=0xYourAddressHere

# CAIP-2 network identifier (eip155:84532 = Base Sepolia, eip155:8453 = Base)
NETWORK=eip155:84532
```

These are only read server-side (in `proxy.ts` and route handlers), so they don't need a `NEXT_PUBLIC_` prefix. Mirror the keys (without values) in `packages/nextjs/.env.example`.

### scaffold.config.ts

x402 payments settle onchain, so `targetNetworks` should include the chain you charge on. For development, use `baseSepolia`:

```typescript
targetNetworks: [chains.baseSepolia],
```

The facilitator needs a real chain to verify and settle payments, so local `hardhat`/`anvil` chains don't work for x402.

## x402 Protocol Flow (v2)

```
Client GET /api/protected
    → Server: no payment header → 402 + PAYMENT-REQUIRED header (price, network, payTo, asset)
Client: signs an EIP-712 authorization (EIP-3009 transferWithAuthorization for USDC;
        Permit2 for tokens without EIP-3009)
Client GET /api/protected + PAYMENT-SIGNATURE header
    → Server: sends the payload to the facilitator for verification
    → Server: runs the handler / serves the content
    → Server: asks the facilitator to settle; response includes PAYMENT-RESPONSE header
    → Facilitator: submits the transfer onchain (and pays the gas)
```

Key insight: **the payer never sends a transaction or needs ETH for gas.** They only sign an authorization; the facilitator submits it. The payer does need the token (e.g. USDC) on the target chain.

v1 used `X-PAYMENT` / `X-PAYMENT-RESPONSE` headers instead. The v2 server/client packages handle the headers for you — only relevant if you inspect requests manually.

## Server Setup

Create one shared resource server and reuse it from the proxy and from route handlers:

```typescript
// packages/nextjs/services/x402.ts
import { HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { x402ResourceServer } from "@x402/next";

export const network = process.env.NETWORK as `${string}:${string}`;
export const payTo = process.env.RESOURCE_WALLET_ADDRESS as `0x${string}`;

const facilitatorClient = new HTTPFacilitatorClient({ url: process.env.FACILITATOR_URL });
export const x402Server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(x402Server);
```

Without registering the EVM scheme, the server can't build or verify EVM payment requirements.

### Protecting API routes — use `withX402`

Wrap the route handler. Settlement only happens **after** the handler returns a successful response (status < 400), so clients aren't charged for failed calls:

```typescript
// packages/nextjs/app/api/payment/builder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { network, payTo, x402Server } from "~~/services/x402";

const handler = async (_req: NextRequest) => {
  return NextResponse.json({ data: "premium data" });
};

export const GET = withX402(
  handler,
  {
    accepts: [{ scheme: "exact", price: "$0.01", network, payTo }],
    description: "Access to premium API data",
    mimeType: "application/json",
  },
  x402Server,
);
```

For dynamic routes (`[id]`, `[...slug]`), key the config by the route pattern (`{ "/api/users/[id]": { accepts: [...] } }`). If a keyed pattern doesn't match the request path, the handler runs **unprotected** (with a one-time warning).

### Protecting pages — use `paymentProxy` in `proxy.ts`

Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`. Put it at `packages/nextjs/proxy.ts` and export `proxy` (if the project is on Next.js < 16, use `middleware.ts` and export `middleware`):

```typescript
// packages/nextjs/proxy.ts
import { paymentProxy } from "@x402/next";
import { createPaywall } from "@x402/paywall";
import { evmPaywall } from "@x402/paywall/evm";
import * as chains from "viem/chains";
import { network, payTo, x402Server } from "~~/services/x402";

const chain = Object.values(chains).find(c => `eip155:${c.id}` === network);

// Paywall UI shown to browsers visiting protected pages
const paywall = createPaywall()
  .withNetwork(evmPaywall)
  .withConfig({
    appName: "My dApp",
    appLogo: "/logo.svg",
    testnet: chain?.testnet ?? false, // viem marks testnets on each chain definition
  })
  .build();

export const proxy = paymentProxy(
  {
    "/payment/:path*": {
      accepts: [{ scheme: "exact", price: "$0.01", network, payTo }],
      description: "Access to premium content",
      mimeType: "text/html",
    },
  },
  x402Server,
  undefined, // paywallConfig (using the custom paywall below instead)
  paywall,
);

// The proxy only runs on paths listed here — keep it in sync with the routes above
export const config = {
  matcher: ["/payment/:path*"],
};
```

`paymentProxy` can also protect API routes, but it charges even when the API responds with an error — prefer `withX402` for APIs.

## Networks and Assets

Networks use [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) identifiers: `eip155:{chainId}` for EVM chains.

| CAIP-2 ID | Chain | Notes |
|-----------|-------|-------|
| `eip155:84532` | Base Sepolia | Common choice for development — test USDC from the [Circle faucet](https://faucet.circle.com/) |
| `eip155:8453` | Base | Mainnet |

`@x402/evm` ships default stablecoin addresses for many more EVM networks; a `"$0.01"` price is converted to that network's default stablecoin (USDC on Base). What actually works also depends on what your **facilitator** supports — check its `/supported` endpoint or the [x402 docs](https://docs.cdp.coinbase.com/x402/welcome).

## Gotchas & Common Pitfalls

**A facilitator is required.** x402 doesn't do peer-to-peer payments: the facilitator verifies signatures and submits settlements. `https://x402.org/facilitator` is meant for testnets. For mainnet, use a facilitator that supports your network (e.g. Coinbase CDP's, which requires API keys) or run your own — check the x402 docs for current options.

**Local chains don't work.** The facilitator can't verify or settle on `hardhat`/`anvil`. Use a testnet like Base Sepolia even during development.

**The `matcher` must cover every proxy-protected route.** A route listed in `paymentProxy` but missing from `matcher` is served for free.

**Keep payment config server-side.** Don't import `services/x402.ts` from client components; it reads server env vars.

## CLI Payment Script (optional)

To test paid API routes without a browser, use `@x402/fetch`. The payer must hold test USDC on the target network.

SE-2 stores the deployer key encrypted (`DEPLOYER_PRIVATE_KEY_ENCRYPTED`), so decrypt it the same way `packages/hardhat/scripts/runHardhatDeployWithPK.ts` does instead of reading a plaintext key (Hardhat flavor shown; for Foundry, load the signer from its keystore or another source):

```bash
yarn workspace @se-2/hardhat add @x402/core @x402/evm @x402/fetch viem
```

```typescript
// packages/hardhat/scripts/send402request.ts
import "dotenv/config";
import { Wallet } from "ethers";
import password from "@inquirer/password";
import { privateKeyToAccount } from "viem/accounts";
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";

const URL = process.argv[2] ?? "http://localhost:3000/api/payment/builder";

async function main() {
  const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;
  if (!encryptedKey) {
    console.log("🚫️ No deployer account. Run `yarn generate` or `yarn account:import` first");
    return;
  }
  const pass = await password({ message: "Enter password to decrypt private key:" });
  const wallet = await Wallet.fromEncryptedJson(encryptedKey, pass);

  const client = new x402Client();
  registerExactEvmScheme(client, { signer: privateKeyToAccount(wallet.privateKey as `0x${string}`) });

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  const response = await fetchWithPayment(URL, { method: "GET" });
  console.log(response.status, await response.json());
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
```

Add a script to `packages/hardhat/package.json` (`"send402request": "tsx scripts/send402request.ts"`) and to the root `package.json` (`"send402request": "yarn workspace @se-2/hardhat send402request"`).

## How to Test

1. Set `targetNetworks: [chains.baseSepolia]` in `scaffold.config.ts`
2. Fill `FACILITATOR_URL`, `RESOURCE_WALLET_ADDRESS` and `NETWORK=eip155:84532` in `packages/nextjs/.env.local`
3. `yarn start`
4. `curl -i http://localhost:3000/api/payment/builder` → should return `402` with a `PAYMENT-REQUIRED` header
5. Visit `http://localhost:3000/payment/...` in a browser → should show the x402 paywall
6. Paid access: `yarn send402request` (payer needs Base Sepolia USDC from the [Circle faucet](https://faucet.circle.com/))

### Production

- Switch `NETWORK` to the mainnet CAIP-2 ID (e.g. `eip155:8453`) and point `FACILITATOR_URL` to a facilitator that supports it
- Update `scaffold.config.ts` to target the mainnet chain
- Set `RESOURCE_WALLET_ADDRESS` to your production payment receiver
- Check the paywall's `testnet` flag is `false` (the example derives it from viem's chain definition for `NETWORK`)
