# x402 -- API Monetization: Detailed Analysis

## Score: 100% with skill | 50% without skill | Delta: +50%

## Efficiency

| Metric | With Skill | Without Skill | Diff |
|--------|-----------|---------------|------|
| Time | 184s (3m 4s) | 324s (5m 24s) | -140s (43% faster) |
| Tokens | 39,805 | 57,391 | -17,586 (31% cheaper) |
| Tool calls | 40 | 61 | -21 (34% fewer) |

## Assertion Breakdown

### Passed in both variants (non-discriminating)
These 5 assertions passed regardless of skill presence -- they test things the model already knows:

1. **middleware.ts exists** -- The model understands Next.js middleware and creates the file in both cases. This is baseline Next.js knowledge.
2. **Protected API route exists** -- Creating API route handlers is standard Next.js App Router knowledge. Both variants created functional routes.
3. **Environment variables configured** -- The model knows payment systems need configuration. Without-skill used different variable names (X402_PAY_TO_ADDRESS vs RESOURCE_WALLET_ADDRESS) but the concept was there.
4. **Middleware matcher covers routes** -- Standard Next.js middleware config. Both variants set up route matching correctly.
5. **scaffold.config.ts targets baseSepolia** -- The model understands x402 runs on Base Sepolia. Without-skill kept hardhat alongside baseSepolia (less clean), but baseSepolia was present.

### Failed without skill (discriminating -- skill provides Capability Uplift)
These 5 assertions are where the skill made the difference:

1. **v2 API (paymentProxy, x402ResourceServer, HTTPFacilitatorClient)** -- Without the skill, the model used `paymentMiddleware` from `x402-next`, which is the **v1 API**. The v2 API restructured everything: `paymentProxy` replaces `paymentMiddleware`, and the server/client split (`x402ResourceServer` + `HTTPFacilitatorClient`) is entirely new. This is a training data cutoff issue -- the model's knowledge predates the v2 release.

2. **registerExactEvmScheme called** -- This is a v2-specific requirement where EVM schemes must be explicitly registered on the resource server. The v1 API didn't have this concept at all, so the model had no way to know about it. Missing this would cause runtime failures.

3. **CAIP-2 network format (eip155:84532)** -- Without the skill, the model used `base-sepolia` (a human-readable name). The v2 API requires CAIP-2 chain identifiers (`eip155:84532`). This is a subtle but critical difference -- the middleware would silently fail to match networks.

4. **Paywall setup (createPaywall + evmPaywall)** -- The v2 paywall builder pattern (`createPaywall().withNetwork(evmPaywall).withConfig({...}).build()`) is completely absent from the without-skill output. Without it, browser visitors hitting a protected page get a raw 402 JSON response instead of a user-friendly payment UI. This is a UX gap, not just a technical one.

5. **Correct @x402/* package names** -- The model hallucinated package names: `x402-fetch` and `x402-next` (non-scoped). The actual packages are `@x402/core`, `@x402/evm`, `@x402/next`, `@x402/paywall`. These non-scoped packages likely don't exist on npm, so `yarn add` would fail immediately.

## Root Cause Analysis

The x402 protocol underwent a major v1 -> v2 rewrite that:
- Renamed all packages to scoped `@x402/*` format
- Restructured the middleware API (paymentMiddleware -> paymentProxy + resource server pattern)
- Added CAIP-2 chain identifiers replacing human-readable names
- Introduced the paywall builder pattern for browser UX

The model's training data contains the v1 API, so without the skill it confidently generates code using an API that no longer exists. This is a **hallucinated API** failure mode -- the model doesn't say "I'm not sure about this API", it just writes v1 code as if it's current.

## Key Takeaway

x402 demonstrates the **stale API knowledge** pattern. The model knows *what* x402 does (payment-gated API routes), understands the *architecture* (middleware + env vars + protected routes), but uses the *wrong API surface*. The skill provides the correct v2 API and package names, turning a project that would fail at `yarn install` into a working implementation.
