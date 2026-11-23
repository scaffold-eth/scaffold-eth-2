---
name: x402
description: "Add x402 payment-gated routes to a Scaffold-ETH 2 project. Use when the user wants to: monetize an API with micropayments, add HTTP 402 payment required to routes, gate content behind crypto payments, implement pay-per-call APIs, or integrate the x402 protocol."
---

# x402 Payment Protocol Integration for Scaffold-ETH 2

## Prerequisites

Check if `./packages/nextjs/scaffold.config.ts` exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## Overview

[x402](https://www.x402.org/) is an open payment protocol by Coinbase that uses HTTP status code 402 ("Payment Required") to enable instant stablecoin micropayments over HTTP. When a client requests a protected resource without payment, the server responds with 402 + payment instructions. The client signs a payment, retries the request, and gets access.

This skill covers integrating x402 into SE-2 using Next.js middleware. For the full protocol spec and advanced usage, refer to the [x402 docs](https://docs.cdp.coinbase.com/x402/welcome) or the [GitHub repo](https://github.com/coinbase/x402). This skill focuses on SE-2 integration specifics and gotchas.

## Dependencies

### NextJS package

Add to `packages/nextjs/package.json`:

```json
{
  "dependencies": {
    "@x402/core": "^2.2.0",
    "@x402/evm": "^2.2.0",
    "@x402/next": "^2.2.0",
    "@x402/paywall": "^2.2.0"
  }
}
```

### Hardhat package (for CLI payment script)

If the user wants a CLI script to test API routes programmatically, add to `packages/hardhat/package.json`:

```json
{
  "scripts": {
    "send402request": "hardhat run scripts/send402request.ts"
  },
  "dependencies": {
    "@x402/core": "^2.2.0",
    "@x402/evm": "^2.2.0",
    "@x402/fetch": "^2.2.0"
  }
}
```

Add to root `package.json`: `"send402request": "yarn workspace @se-2/hardhat send402request"`

### Environment variables

Create `packages/nextjs/.env.development` (or `.env.local`):

```env
# Facilitator service URL — verifies and settles payments
# Default testnet facilitator (free, no signup needed):
NEXT_PUBLIC_FACILITATOR_URL=https://x402.org/facilitator

# Address that receives payments (set to your deployer or any wallet)
RESOURCE_WALLET_ADDRESS=0xYourAddressHere

# CAIP-2 network identifier (eip155:84532 = Base Sepolia, eip155:8453 = Base Mainnet)
NETWORK=eip155:84532
```

### scaffold.config.ts

x402 payments happen onchain, so `targetNetworks` must include a supported chain. For development, use `baseSepolia`:

```typescript
targetNetworks: [chains.baseSepolia],
```

**Do not use `hardhat` (localhost) as the target network for x402** — the facilitator needs a real chain to verify/settle payments.

## x402 Protocol Flow

```
Client GET /api/protected
    → Server: no X-PAYMENT header → responds 402 + PAYMENT-REQUIRED header
Client: signs EIP-712 payment authorization (USDC approve)
Client GET /api/protected + X-PAYMENT header
    → Server middleware: sends payment to facilitator for verification
    → Facilitator: verifies signature, checks balance
    → Server: serves content
    → Server middleware: sends settlement to facilitator
    → Facilitator: executes the USDC transfer onchain
```

Key insight: **The user never sends a transaction themselves.** They sign an EIP-712 message authorizing a USDC transfer. The facilitator executes it after the server confirms content was delivered.

## Middleware Configuration

The core of x402 integration is `middleware.ts` in the Next.js app root. The v2 API uses `paymentProxy` from `@x402/next` with explicit server and paywall setup.

```typescript
// packages/nextjs/middleware.ts
import { paymentProxy } from "@x402/next";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { createPaywall } from "@x402/paywall";
import { evmPaywall } from "@x402/paywall/evm";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL!;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as `0x${string}`;
const network = process.env.NETWORK as `${string}:${string}`;

// Create facilitator client and resource server
const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
const server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(server);

// Create paywall UI (shown to browsers visiting protected pages)
const paywall = createPaywall()
  .withNetwork(evmPaywall)
  .withConfig({
    appName: "My dApp",
    appLogo: "/logo.png",
    testnet: true, // set false for mainnet
  })
  .build();

export const middleware = paymentProxy(
  {
    "/api/payment/:path*": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.01",
          network,
          payTo,
        },
      ],
      description: "Access to premium API data",
      mimeType: "application/json",
    },
    "/payment/:path*": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.01",
          network,
          payTo,
        },
      ],
      description: "Access to premium content",
      mimeType: "text/html",
    },
  },
  server,
  undefined, // optional request context
  paywall,
);

// IMPORTANT: matcher must cover all protected routes
export const config = {
  matcher: ["/api/payment/:path*", "/payment/:path*"],
};
```

## CAIP-2 Network Identifiers

The v2 API uses [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) network identifiers — format: `eip155:{chainId}` for EVM chains.

| CAIP-2 ID | Chain | Notes |
|-----------|-------|-------|
| `eip155:84532` | Base Sepolia | Default for development — [Circle faucet](https://faucet.circle.com/) for test USDC |
| `eip155:8453` | Base | Recommended for production — lowest fees |

Legacy network names (`base-sepolia`, `base`, etc.) may still work for backwards compatibility, but prefer CAIP-2 format. For the full list of supported networks, check the [x402 docs](https://docs.cdp.coinbase.com/x402/welcome).

## Gotchas & Common Pitfalls

**Facilitator is required.** x402 doesn't do peer-to-peer payments. The facilitator service verifies signatures and executes settlements. For testnet, `https://x402.org/facilitator` works without signup. For production, you may need to run your own — check [x402 docs](https://docs.cdp.coinbase.com/x402/welcome).

**Register the EVM scheme.** The server needs `registerExactEvmScheme(server)` in middleware.ts. Without this, payment payloads won't be understood.

**Payments are in USDC by default.** The `$0.01` price syntax means USDC.

**Don't use `hardhat` localhost as the network.** The facilitator can't verify or settle payments on a local chain. Always use a testnet (`eip155:84532`) even during development.

**The `matcher` in `middleware.ts` must cover protected routes.** If you add a new protected route in the routes config but forget to add it to `matcher`, the middleware won't run on that route.

## CLI Payment Script

For testing API routes programmatically (without a browser), create a script using `@x402/fetch`:

```typescript
// packages/hardhat/scripts/send402request.ts
import { privateKeyToAccount } from "viem/accounts";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) { console.log("No deployer key. Run `yarn generate` first."); return; }

  const signer = privateKeyToAccount(privateKey);
  const client = new x402Client();
  registerExactEvmScheme(client, { signer });

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  const response = await fetchWithPayment("http://localhost:3000/api/payment/builder", { method: "GET" });
  console.log("Response:", await response.json());
}

main().catch(console.error);
```

> **Note:** Register the EVM scheme on the client side too — `registerExactEvmScheme(client, { signer })` from `@x402/evm/exact/client`.

## How to Test

1. Set `targetNetworks: [chains.baseSepolia]` in `scaffold.config.ts`
2. Configure `.env.development` with facilitator URL, pay-to address, and `NETWORK=eip155:84532`
3. `yarn start` — visit `http://localhost:3000`
4. Navigate to a protected page — you should see the x402 paywall
5. To test API routes: `curl http://localhost:3000/api/payment/builder` should return 402 with `PAYMENT-REQUIRED` header
6. To test paid access: `yarn send402request` (needs funded wallet on Base Sepolia — get test USDC from [Circle faucet](https://faucet.circle.com/))

### Production

- Switch `NETWORK` to `eip155:8453` (Base mainnet)
- Update `scaffold.config.ts` to target the mainnet chain
- Set `RESOURCE_WALLET_ADDRESS` to your production payment receiver
- Set `testnet: false` in paywall config
