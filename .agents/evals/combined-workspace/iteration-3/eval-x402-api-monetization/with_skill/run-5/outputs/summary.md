# x402 API Monetization Implementation

## What was built

A payment-gated API endpoint in an SE-2 dApp using the x402 protocol. When a client calls `/api/payment/builder`, they must pay $0.01 USDC on Base Sepolia to access the data. Without payment, the server returns HTTP 402 (Payment Required).

## Files created

- **`packages/nextjs/middleware.ts`** — x402 payment proxy middleware that intercepts requests to `/api/payment/*` and `/payment/*` routes. Uses `@x402/next` with `HTTPFacilitatorClient`, `x402ResourceServer`, and a paywall UI for browser visitors.
- **`packages/nextjs/app/api/payment/builder/route.ts`** — Protected API route that returns premium builder data (list of builders with specialties, ratings). Only accessible after payment verification by the facilitator.
- **`packages/nextjs/app/paid-api/page.tsx`** — Frontend page demonstrating the paid API. Lets users call the protected endpoint and see the 402 response. Explains how to test with the CLI script.
- **`packages/nextjs/.env.development`** — Environment variables for x402: facilitator URL, recipient wallet address, and CAIP-2 network identifier (Base Sepolia).
- **`packages/hardhat/scripts/send402request.ts`** — CLI script using `@x402/fetch` to programmatically call the paid API with automatic USDC payment signing.
- **`packages/hardhat/x402.d.ts`** — TypeScript declarations for `@x402/fetch` and `@x402/evm/exact/client` to resolve ESM imports in Hardhat's environment.

## Files modified

- **`packages/nextjs/scaffold.config.ts`** — Changed `targetNetworks` from `chains.hardhat` to `chains.baseSepolia` (x402 requires a real chain for facilitator verification).
- **`packages/nextjs/package.json`** — Added `@x402/core`, `@x402/evm`, `@x402/next`, `@x402/paywall` dependencies.
- **`packages/hardhat/package.json`** — Added `send402request` script and `@x402/core`, `@x402/evm`, `@x402/fetch` dependencies.
- **`packages/nextjs/components/Header.tsx`** — Added "Paid API" navigation link with a dollar icon.
- **`package.json`** (root) — Added `send402request` workspace script.

## How to test

1. Set `RESOURCE_WALLET_ADDRESS` in `packages/nextjs/.env.development` to your wallet address
2. Run `yarn start` and visit `http://localhost:3000/paid-api`
3. Click "Call /api/payment/builder" to see the 402 response
4. For a paid request: `yarn generate`, fund with test USDC from faucet.circle.com, then `yarn send402request`
