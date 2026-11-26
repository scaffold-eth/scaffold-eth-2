---
name: deploy-frontend
description: "Use when deploying, hosting or publishing the frontend/website (not contracts): IPFS (`yarn ipfs`), Vercel, or an ENS name."
---

# Deploying a Scaffold-ETH 2 Frontend

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Before building

- **Networks:** `targetNetworks` in `scaffold.config.ts` must list the live chain(s) the contracts are deployed to, and `deployedContracts.ts` / `externalContracts.ts` must hold those chains' addresses. A build pointed at `chains.hardhat` / `chains.foundry` ships fine and then shows nothing.
- **Keys:** set `NEXT_PUBLIC_ALCHEMY_API_KEY` and `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` in the environment (the shell or `.env.local` for IPFS, the project env on Vercel), not in the committed `scaffold.config.ts`. Without them the build silently uses SE-2's shared, rate-limited defaults: the site works at release and degrades later. While the default Alchemy key is in use, `services/web3/wagmiConfig.tsx` also sends reads to each chain's public RPC first and uses Alchemy only as a fallback.
- **RPC:** to use another provider for a chain, set its `rpcOverrides` entry in `scaffold.config.ts` to a URL read from a `NEXT_PUBLIC_*` env var. Every `NEXT_PUBLIC_*` value ships in the client bundle, so use keys restricted to the production domain. Lowering `pollingInterval` (default 3000 ms) multiplies the RPC requests from every open tab.
- **Branding:** a release still shows SE-2's defaults until they are replaced: the title and description in `app/layout.tsx`, `titleTemplate` (`"%s | Scaffold-ETH 2"`) in `utils/scaffold-eth/getMetadata.ts`, the name and logo in `components/Header.tsx`, the home page (`app/page.tsx`), the links in `components/Footer.tsx`, `public/` (`favicon.png`, `logo.svg`, `thumbnail.jpg` for Open Graph, `manifest.json`) and the root `README.md`. Take names and assets from the user; don't invent them.

## IPFS

```bash
cd packages/nextjs
rm -rf .next out # stale .next/dev types and old out/ files survive otherwise
NEXT_PUBLIC_PRODUCTION_URL="https://<production-domain>" yarn ipfs
```

`yarn ipfs` builds the static export (`NEXT_PUBLIC_IPFS_BUILD=true` turns it on in `next.config.ts`), uploads `out/` to BuidlGuidl IPFS and prints `https://community.bgipfs.com/ipfs/<CID>` after `🚀 Upload complete`. Without `NEXT_PUBLIC_PRODUCTION_URL`, Open Graph and Twitter metadata point at `http://localhost:3000` (`utils/scaffold-eth/getMetadata.ts`).

The upload needs a bgipfs API key (https://www.bgipfs.com) or a per-upload USDC payment; without either it fails with "Payment required". Never set either up yourself, enter keys or pay: hand the setup to the user (`yarn bgipfs upload config init --help` in `packages/nextjs`). What trips it up:

- `config init` never overwrites an existing `ipfs-upload.config.json`, and `yarn ipfs` creates one without payment on its first run: move that file aside before running `config init` again.
- `yarn ipfs` captures the upload output, so bgipfs can't prompt: paying from a keystore needs `BGIPFS_KEYSTORE_PASSWORD` exported in the same shell.
- "The configured payment was not accepted" charges nothing and is often a temporary settlement error: retry the upload step (`yarn bgipfs upload out`, no rebuild needed) a few times, a short wait apart, and report it to the user if it keeps failing instead of changing the setup.

What a static export can't serve:

- **API routes** (`app/api/**`, e.g. from the siwe, x402 or drizzle-neon skills): the build still passes, but they are left out of `out/`, so every call to them returns 404. Host those on a server (Vercel) instead.
- **Dynamic routes** (`/blockexplorer/address/[address]`, `/blockexplorer/transaction/[txHash]`): only the placeholder path from `generateStaticParams` is exported, so opening any other address or transaction URL directly returns 404.

## Vercel

`yarn vercel` (preview) or `yarn vercel --prod`, after `yarn vercel:login`. Vercel sets `VERCEL_PROJECT_PRODUCTION_URL`, so metadata gets the right origin without extra config. `yarn vercel:yolo --prod` ships even with TypeScript errors (`NEXT_PUBLIC_IGNORE_BUILD_ERROR=true`): use it only when the user asks for it.

## ENS

Point an ENS name at the release by setting its contenthash to `ipfs://<CID>` (in the ENS app, or on-chain via the resolver). That's a mainnet transaction the user sends from the name's owner account, never you: hand it over only after the user has reviewed the gateway URL and approved that CID.

## Done When

Run each check and report what you saw:

1. `grep -rnE "Scaffold-ETH|scaffold-eth/se-2|buidlguidl.com" packages/nextjs/app packages/nextjs/components packages/nextjs/public/manifest.json packages/nextjs/utils/scaffold-eth/getMetadata.ts README.md` shows only defaults the user chose to keep (e.g. on `/debug`), and `favicon.png`, `logo.svg` and `thumbnail.jpg` were replaced or kept on purpose
2. IPFS: `out/index.html`, `out/debug/index.html` and `out/blockexplorer/index.html` exist (one `index.html` per route), and `grep -o 'og:image" content="[^"]*' out/index.html` shows the production origin, not `localhost`
3. IPFS: the CID is reported. A CID unchanged from the previous release means the uploaded bytes are identical: recheck the build before blaming gateway caching
4. Both `<site>/` and `<site>/debug/` return 200 (`curl -s -o /dev/null -w "%{http_code}" -L <url>`), where `<site>` is `https://community.bgipfs.com/ipfs/<CID>` or the Vercel URL: a working root doesn't prove the other routes resolve
5. ENS: the name's contenthash resolves to the approved CID, and the site loads through an ENS gateway (`https://<name>.eth.limo`)
