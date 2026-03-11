# x402 API Monetization - Implementation Summary

## What was built

A pay-per-request API monetization system using the **x402 protocol** integrated into a Scaffold-ETH 2 dApp. API consumers pay **$0.001 USDC** on **Base Sepolia** for each API call, with payments verified and settled automatically by the x402 facilitator service.

## Architecture

### Server Side - Payment-Gated API Routes

**Weather API** (`packages/nextjs/app/api/weather/route.ts`)
- GET endpoint returning weather data for 5 major cities (New York, London, Tokyo, Paris, Sydney)
- Supports optional `?city=` query parameter to filter by specific city
- Protected by `withX402` wrapper from `x402-next` requiring $0.001 USDC per request on Base Sepolia
- Returns 402 Payment Required for unpaid requests; only settles payment on successful (status < 400) responses

**Joke API** (`packages/nextjs/app/api/joke/route.ts`)
- GET endpoint returning random developer/crypto jokes
- Protected by `withX402` wrapper requiring $0.001 USDC per request on Base Sepolia
- Same payment-after-success guarantee as the weather API

### Client Side - Frontend Dashboard

**Paid API Page** (`packages/nextjs/app/paid-api/page.tsx`)
- Interactive page at `/paid-api` showcasing all available paid endpoints
- Each endpoint displayed as a DaisyUI card with description, price badge, network badge, and "Try API Call" button
- Demonstrates the 402 Payment Required response when calling without payment
- Parses and displays x402 payment requirements from the 402 response headers (payTo address, network, amount)
- Includes a 3-step "How It Works" section explaining the payment flow
- Provides an integration guide with code examples for using `@x402/fetch` and `@x402/evm` to make paid requests programmatically
- Styled entirely with DaisyUI component classes (cards, badges, alerts, buttons, mockup-code, dividers)

### Configuration Changes

- **`packages/nextjs/components/Header.tsx`** - Added "Paid API" navigation link with `CurrencyDollarIcon`
- **`packages/nextjs/scaffold.config.ts`** - Added `chains.baseSepolia` to `targetNetworks` alongside `chains.hardhat`
- **`packages/nextjs/package.json`** - Added `x402-next` (^1.1.0) dependency (the official Coinbase x402 Next.js integration)
- **`packages/nextjs/.env.example`** - Added `X402_PAYTO_ADDRESS` environment variable

## x402 Payment Flow

1. Client makes GET request to `/api/weather` or `/api/joke`
2. Server responds with **402 Payment Required** plus payment requirements header (price, network, payTo address, asset)
3. An x402-compatible client (e.g., `wrapFetchWithPayment` from `@x402/fetch`) intercepts the 402, signs a typed-data USDC payment authorization via the user's wallet
4. Client retries the request with the signed payment in the `X-PAYMENT` header
5. Server's `withX402` wrapper verifies the payment via the facilitator, runs the handler, and settles payment only if the response succeeds (status < 400)

## Key Design Decisions

- **`withX402` over `paymentMiddleware`**: Used the route handler wrapper rather than Next.js middleware-level protection. This guarantees payment settlement only occurs after a successful API response, protecting consumers from paying for failed requests.
- **Base Sepolia testnet**: Standard x402 development network. For production, switch to `"base"` and use Coinbase hosted facilitator (`https://api.cdp.coinbase.com/platform/v2/x402`).
- **Default facilitator**: Uses the default x402.org facilitator for testnet without additional configuration.
- **Server-side payment address**: `X402_PAYTO_ADDRESS` is not prefixed with `NEXT_PUBLIC_` since it's only used in API route handlers.

## Packages Used

| Package | Purpose |
|---------|---------|
| `x402-next` | Next.js integration with `withX402` wrapper for API routes and `paymentMiddleware` for page routes |

The `x402-next` package internally depends on `x402` (core protocol), `viem` (EVM interactions), and `@coinbase/cdp-sdk` (Coinbase Developer Platform).

## Files Created/Modified

| File | Action |
|------|--------|
| `packages/nextjs/app/api/weather/route.ts` | Created |
| `packages/nextjs/app/api/joke/route.ts` | Created |
| `packages/nextjs/app/paid-api/page.tsx` | Created |
| `packages/nextjs/components/Header.tsx` | Modified |
| `packages/nextjs/scaffold.config.ts` | Modified |
| `packages/nextjs/package.json` | Modified |
| `packages/nextjs/.env.example` | Modified |

## Setup Instructions

1. Set `X402_PAYTO_ADDRESS` in `.env.local` to your wallet address (the address receiving payments)
2. Ensure you have USDC on Base Sepolia for testing as a consumer
3. Run `yarn install` then `yarn start` and navigate to the "Paid API" page
4. To call the paid endpoints programmatically, use `@x402/fetch` with a funded wallet
