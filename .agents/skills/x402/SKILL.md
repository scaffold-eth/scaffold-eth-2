---
name: x402
description: "Use when the user wants to charge for API routes or pages with x402 (HTTP 402) stablecoin micropayments."
---

# x402 Payment Protocol Integration for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Overview

[x402](https://www.x402.org/) gates HTTP resources behind stablecoin payments: the server answers `402 Payment Required` with payment instructions, the client signs an authorization (EIP-3009 for USDC) and retries, and a **facilitator** verifies the signature and settles it onchain. The payer only signs, so they need the token (e.g. USDC) but no ETH for gas.

This skill covers x402 v2 (`@x402/*` packages) in SE-2's Next.js app. Older examples use the v1 packages (`x402-next`, `x402-fetch`) and `X-PAYMENT` headers; the v2 packages handle the `PAYMENT-*` headers for you. For the rest, see the [x402 docs](https://docs.cdp.coinbase.com/x402/welcome) and the package READMEs in the [GitHub repo](https://github.com/coinbase/x402).

## Setup

```bash
yarn workspace @se-2/nextjs add @x402/core @x402/evm @x402/next @x402/paywall
```

**Check the `next` peer dependency.** `@x402/next` releases often require a newer Next.js than the project's. If yarn warns about an unmet `next` peer, either upgrade `next` in `packages/nextjs`, or find the newest release whose range fits (`npm view @x402/next@<version> peerDependencies`) and install every `@x402/*` package at that same version.

Add to `packages/nextjs/.env.local` (and the keys, without values, to `.env.example`). They're read only on the server, so no `NEXT_PUBLIC_` prefix:

```env
# Verifies and settles payments. https://x402.org/facilitator is the default testnet facilitator (no signup)
FACILITATOR_URL=https://x402.org/facilitator
# Address that receives payments
RESOURCE_WALLET_ADDRESS=0xYourAddressHere
# CAIP-2 network ID: eip155:84532 = Base Sepolia (test USDC from https://faucet.circle.com/), eip155:8453 = Base
NETWORK=eip155:84532
```

The facilitator settles on a real chain, so local `hardhat`/`anvil` chains don't work: develop on a testnet like Base Sepolia, and add it to `targetNetworks` in `scaffold.config.ts`. A `"$0.01"` price is paid in the network's default stablecoin (USDC on Base); which networks work depends on what the facilitator supports (its `/supported` endpoint).

## Server Setup

One resource server, shared by the proxy and the route handlers:

```typescript
// packages/nextjs/services/x402.ts
// Server-only: it reads server env vars
import { HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { x402ResourceServer } from "@x402/next";

export const network = process.env.NETWORK as `${string}:${string}`;
export const payTo = process.env.RESOURCE_WALLET_ADDRESS as `0x${string}`;

const facilitatorClient = new HTTPFacilitatorClient({ url: process.env.FACILITATOR_URL });
export const x402Server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(x402Server); // without it, the server can't build or verify EVM payment requirements
```

### API routes: `withX402`

`withX402` settles only **after** the handler returns a successful response (status < 400), so clients aren't charged for failed calls:

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

### Pages: `paymentProxy` in `proxy.ts`

Next.js 16 renamed `middleware.ts` to `proxy.ts` (on Next.js < 16, use `middleware.ts` and export `middleware`). `paymentProxy` charges even when the response is an error, so use it for pages and `withX402` for APIs:

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

// The proxy only runs on these paths: a route listed above but missing here is served for free
export const config = {
  matcher: ["/payment/:path*"],
};
```

## CLI Payment Script (optional)

To test paid API routes without a browser, use `@x402/fetch`. SE-2 stores the deployer key encrypted (`DEPLOYER_PRIVATE_KEY_ENCRYPTED`), so decrypt it the way `packages/hardhat/scripts/runHardhatDeployWithPK.ts` does (Hardhat flavor shown; for Foundry, load the signer from its keystore):

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

const TARGET_URL = process.argv[2] ?? "http://localhost:3000/api/payment/builder";

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
  const response = await fetchWithPayment(TARGET_URL, { method: "GET" });
  console.log(response.status, await response.json());
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
```

Add `"send402request": "tsx scripts/send402request.ts"` to `packages/hardhat/package.json`, and a root script that forwards to it.

## Done When

With `yarn start` running and the env vars set, run each check and report what you saw:

1. `curl -i http://localhost:3000/api/payment/builder` returns `402` with a `PAYMENT-REQUIRED` header
2. Opening a protected page (e.g. `http://localhost:3000/payment/...`) in a browser shows the x402 paywall
3. If the payer holds test USDC: `yarn send402request` returns `200` with the data

## Production

- Switch `NETWORK` to the mainnet CAIP-2 ID (e.g. `eip155:8453`) and `targetNetworks` to the mainnet chain
- Point `FACILITATOR_URL` to a facilitator that supports it: `https://x402.org/facilitator` is for testnets; use e.g. Coinbase CDP's (requires API keys) or run your own
- Set `RESOURCE_WALLET_ADDRESS` to the production payment receiver
