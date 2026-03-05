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

## Dependencies & Scripts

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

### Root package.json scripts

```json
{
  "send402request": "yarn workspace @se-2/hardhat send402request"
}
```

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

Understanding the flow is critical for debugging:

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

Key insight: **The user never sends a transaction themselves.** They sign an EIP-712 message authorizing a USDC transfer. The facilitator executes it after the server confirms content was delivered. This is why x402 payments are instant from the user's perspective.

## Middleware Configuration

The core of x402 integration is `middleware.ts` in the Next.js app root. The v2 API uses `paymentProxy` from `@x402/next` with explicit server and paywall setup.

### Basic middleware

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

### Route configuration

Each route maps to a resource config with `accepts` (payment requirements), `description`, and `mimeType`:

```typescript
{
  "/api/data/*": {
    accepts: [
      {
        scheme: "exact",           // payment scheme
        price: "$0.01",            // USDC amount (dollar string)
        network: "eip155:84532",   // CAIP-2 network ID
        payTo: "0x...",            // recipient address
      },
    ],
    description: "Premium data endpoint",
    mimeType: "application/json",
  },
}
```

Multiple `accepts` entries can offer different payment options (different networks, assets, or prices) for the same route.

### Server and paywall setup

The v2 API separates concerns into three objects:

| Object | Role | Required |
|--------|------|----------|
| `HTTPFacilitatorClient` | Communicates with the facilitator service for verify/settle | Yes |
| `x402ResourceServer` | Orchestrates the payment flow (verify → serve → settle) | Yes |
| `createPaywall().build()` | Renders a payment UI for browser visitors | Optional (API-only routes don't need it) |

The `registerExactEvmScheme(server)` call enables EVM payment processing. Without it, the server won't understand EVM payment payloads.

## CAIP-2 Network Identifiers

The v2 API uses [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) network identifiers instead of plain names. Format: `eip155:{chainId}` for EVM chains.

| CAIP-2 ID | Chain | Type | Notes |
|-----------|-------|------|-------|
| `eip155:8453` | Base | Mainnet | Recommended for production — lowest fees |
| `eip155:84532` | Base Sepolia | Testnet | Default for development — [Circle faucet](https://faucet.circle.com/) for test USDC |
| `eip155:137` | Polygon | Mainnet | |
| `eip155:80002` | Polygon Amoy | Testnet | |
| `eip155:43114` | Avalanche | Mainnet | |
| `eip155:43113` | Avalanche Fuji | Testnet | |
| `eip155:2741` | Abstract | Mainnet | |
| `eip155:11124` | Abstract Testnet | Testnet | |
| `eip155:1` | Ethereum | Mainnet | |
| `eip155:11155111` | Sepolia | Testnet | |

Legacy network names (`base-sepolia`, `base`, etc.) may still work for backwards compatibility, but prefer CAIP-2 format. For the full list of supported networks, check the [x402 docs](https://docs.cdp.coinbase.com/x402/welcome).

**For SE-2 development, use `eip155:84532` (Base Sepolia).** Make sure `scaffold.config.ts` targets `chains.baseSepolia`.

## Gotchas & Common Pitfalls

**Facilitator is required.** x402 doesn't do peer-to-peer payments. The facilitator service verifies signatures and executes settlements. For testnet, `https://x402.org/facilitator` works without signup. For production on mainnet, you may need to run your own or use a hosted facilitator — check [x402 docs](https://docs.cdp.coinbase.com/x402/welcome).

**Register the EVM scheme on both server and client.** The server needs `registerExactEvmScheme(server)` in middleware.ts, and the CLI client needs `registerExactEvmScheme(client, { signer })` from `@x402/evm/exact/client`. Without this, payment payloads won't be understood.

**Payments are in USDC by default.** The `$0.01` price syntax means USDC. For other assets, use explicit `amount` + `asset` in the accepts config.

**Users need USDC on the right chain.** If a user visits a protected page without USDC on Base Sepolia, the paywall will show but they can't pay. Set `testnet: true` in paywall config for testnet chains.

**`middleware.ts` runs on ALL matching routes, including prefetches.** Next.js prefetches links, which can trigger 402 responses for protected pages. This is expected — the actual payment only happens when the user interacts with the paywall.

**Browser vs API behavior differs.** When a browser hits a protected page route, the paywall UI handles the payment flow client-side. For API routes, it returns a 402 response with a `PAYMENT-REQUIRED` header (base64-encoded JSON) that programmatic clients (like `@x402/fetch`) process automatically.

**Don't use `hardhat` localhost as the network.** The facilitator can't verify or settle payments on a local chain. Always use a testnet (`eip155:84532`) even during development.

**The `matcher` in `middleware.ts` must cover protected routes.** If you add a new protected route in the routes config but forget to add it to `matcher`, the middleware won't run on that route.

**Type declarations may be needed for Hardhat scripts.** The `@x402/*` packages use ESM exports which may not resolve cleanly in Hardhat's CommonJS environment. Add a declaration file if you get type errors:

```typescript
// packages/hardhat/x402.d.ts
declare module "@x402/fetch" {
  export class x402Client { constructor(); }
  export function wrapFetchWithPayment(fetchFn: typeof fetch, client: x402Client): typeof fetch;
}

declare module "@x402/evm/exact/client" {
  import type { Account } from "viem/accounts";
  import type { x402Client } from "@x402/fetch";
  export function registerExactEvmScheme(client: x402Client, config: { signer: Account }): void;
}
```

## CLI Payment Script

For testing API routes programmatically (without a browser), create a script using `@x402/fetch`:

```typescript
// packages/hardhat/scripts/send402request.ts
import { privateKeyToAccount } from "viem/accounts";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";

const API_URL = "http://localhost:3000/api/payment/builder";

async function main() {
  // Use SE-2's deployer account (yarn generate / yarn account:import)
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    console.log("No deployer key found. Run `yarn generate` first.");
    return;
  }

  const signer = privateKeyToAccount(privateKey);

  // Create x402 client and register EVM payment scheme
  const client = new x402Client();
  registerExactEvmScheme(client, { signer });

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);

  console.log("Sending x402 request from", signer.address);

  const response = await fetchWithPayment(API_URL, { method: "GET" });
  const body = await response.json();
  console.log("Response:", body);

  // Check settlement receipt
  const paymentResponse = response.headers.get("PAYMENT-RESPONSE");
  if (paymentResponse) {
    console.log("Payment settled:", paymentResponse);
  }
}

main().catch(console.error);
```

## How to Test

1. Set `targetNetworks: [chains.baseSepolia]` in `scaffold.config.ts`
2. Configure `.env.development` (or `.env.local`) with facilitator URL, pay-to address, and `NETWORK=eip155:84532`
3. `yarn start` — visit `http://localhost:3000`
4. Navigate to a protected page route — you should see the x402 paywall
5. To test API routes: `curl http://localhost:3000/api/payment/builder` should return a 402 response with `PAYMENT-REQUIRED` header
6. To test paid access: `yarn send402request` (needs a funded wallet on Base Sepolia — get test USDC from [Circle faucet](https://faucet.circle.com/))

### Production

- Switch `NETWORK` to `eip155:8453` (Base mainnet) or another mainnet CAIP-2 ID
- Update `scaffold.config.ts` to target the mainnet chain
- Set `RESOURCE_WALLET_ADDRESS` to your production payment receiver
- Set `testnet: false` in paywall config
- Consider running your own facilitator or using a production-grade hosted one
