# x402 API Monetization Implementation

## What Was Built

A payment-gated API endpoint and premium page using the x402 protocol (HTTP 402 micropayments) integrated into Scaffold-ETH 2. When a client calls `/api/payment/builder` without payment, the x402 middleware returns a 402 response with payment instructions. When a browser visits `/payment/builder`, a paywall UI is displayed. After paying $0.01 USDC on Base Sepolia, access is granted. A CLI script (`yarn send402request`) is also provided for programmatic testing.

## Files Created

1. **`packages/nextjs/middleware.ts`**
   - Core x402 integration using the v2 API. Configures `paymentProxy` from `@x402/next` with `HTTPFacilitatorClient`, `x402ResourceServer`, and `registerExactEvmScheme(server)` for EVM payment processing. Creates a paywall via `createPaywall().withNetwork(evmPaywall)`. Protects `/api/payment/*` (JSON API routes) and `/payment/*` (browser pages with paywall UI). Each route requires a $0.01 USDC exact payment on the configured network (CAIP-2 format from env). Matcher config covers both protected route patterns.

2. **`packages/nextjs/app/api/payment/builder/route.ts`**
   - Protected API endpoint that returns a premium builder leaderboard (top builders with addresses, reputation scores, and projects shipped). Only accessible after x402 payment verification by the middleware.

3. **`packages/nextjs/app/payment/builder/page.tsx`**
   - Protected page that displays a premium builder dashboard. When visited in a browser, the x402 paywall intercepts and shows a payment UI. After payment, the page fetches from the API and renders a leaderboard table plus an explanation of how the x402 protocol works. Uses DaisyUI component classes (card, table, alert, loading).

4. **`packages/nextjs/.env.development`**
   - Environment variables for x402: `NEXT_PUBLIC_FACILITATOR_URL` set to `https://x402.org/facilitator` (testnet facilitator), `RESOURCE_WALLET_ADDRESS` placeholder, and `NETWORK` set to `eip155:84532` (Base Sepolia CAIP-2 identifier).

5. **`packages/hardhat/scripts/send402request.ts`**
   - CLI script for programmatic testing. Uses `@x402/fetch` with `wrapFetchWithPayment` and registers the EVM scheme via `registerExactEvmScheme(client, { signer })`. Signs EIP-712 payment authorizations using the deployer's private key and sends a request to the protected API endpoint.

6. **`packages/hardhat/x402.d.ts`**
   - TypeScript type declarations for `@x402/fetch` and `@x402/evm/exact/client` to resolve ESM module issues in Hardhat's CommonJS environment.

## Files Modified

7. **`packages/nextjs/scaffold.config.ts`**
   - Changed `targetNetworks` from `[chains.hardhat]` to `[chains.baseSepolia]`. x402 requires a real chain because the facilitator cannot verify/settle payments on localhost.

8. **`packages/nextjs/package.json`**
   - Added dependencies: `@x402/core`, `@x402/evm`, `@x402/next`, `@x402/paywall` (all `^2.2.0`).

9. **`packages/hardhat/package.json`**
   - Added `send402request` script and dependencies: `@x402/core`, `@x402/evm`, `@x402/fetch` (all `^2.2.0`).

10. **`package.json` (root)**
    - Added root-level `send402request` script that delegates to the hardhat workspace.

11. **`packages/nextjs/components/Header.tsx`**
    - Added "Premium API" navigation link with `CurrencyDollarIcon` pointing to `/payment/builder`.

## How to Test

1. Set `RESOURCE_WALLET_ADDRESS` in `packages/nextjs/.env.development` to your wallet address.
2. Run `yarn install` to install x402 dependencies.
3. Run `yarn start` and visit `http://localhost:3000`.
4. Click "Premium API" in the navigation to see the x402 paywall.
5. `curl http://localhost:3000/api/payment/builder` should return a 402 response with a `PAYMENT-REQUIRED` header.
6. Run `yarn send402request` with a funded wallet on Base Sepolia (get test USDC from https://faucet.circle.com/).
