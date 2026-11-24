---
name: release-frontend
description: "Use when releasing the frontend: publishing it to IPFS (`yarn ipfs`), Vercel, or an ENS name."
---

# Shipping a Scaffold-ETH 2 Frontend

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

Before building, `targetNetworks` in `scaffold.config.ts` must list the live chain(s) the contracts are deployed to, and `deployedContracts.ts` / `externalContracts.ts` must hold those chains' addresses. A build pointed at `chains.hardhat` / `chains.foundry` ships fine and then shows nothing.

## IPFS

```bash
cd packages/nextjs
rm -rf .next out # stale .next/dev types and old out/ files survive otherwise
NEXT_PUBLIC_PRODUCTION_URL="https://<production-domain>" yarn ipfs
```

`yarn ipfs` builds the static export (`NEXT_PUBLIC_IPFS_BUILD=true` turns it on in `next.config.ts`), uploads `out/` to BuidlGuidl IPFS and prints `https://community.bgipfs.com/ipfs/<CID>`. Without `NEXT_PUBLIC_PRODUCTION_URL`, Open Graph and Twitter metadata point at `http://localhost:3000` (`utils/scaffold-eth/getMetadata.ts`).

The upload needs a bgipfs API key (https://www.bgipfs.com) or a per-upload USDC payment; without either it fails with "Payment required". The user sets this up, never the agent: don't enter keys or pay. To pay from the `yarn account` wallet, which needs USDC on the chain the error names:

```bash
cd packages/nextjs
rm -f ipfs-upload.config.json # `config init` never overwrites it, and `yarn ipfs` creates one without payment
# Hardhat: the keystore is the encrypted JSON in packages/hardhat/.env
node -e 'require("dotenv").config({path:"../hardhat/.env"});process.stdout.write(process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED)' > /tmp/se2-keystore.json
yarn bgipfs upload config init -u https://upload.bgipfs.com --keystore /tmp/se2-keystore.json # Foundry: --keystore scaffold-eth-custom
# `yarn ipfs` captures the upload output, so bgipfs can't prompt; an empty value counts as unset
read -rsp "Keystore password: " BGIPFS_KEYSTORE_PASSWORD; echo; export BGIPFS_KEYSTORE_PASSWORD
NEXT_PUBLIC_PRODUCTION_URL="https://<production-domain>" yarn ipfs
unset BGIPFS_KEYSTORE_PASSWORD; rm /tmp/se2-keystore.json
```

What a static export can't serve:

- **API routes** (`app/api/**`, e.g. from the siwe, x402 or drizzle-neon skills): the export build fails. Host those on a server (Vercel) instead.
- **Dynamic routes** (`/blockexplorer/address/[address]`, `/blockexplorer/transaction/[txHash]`): only the placeholder path from `generateStaticParams` is exported, so opening any other address or transaction URL directly returns 404.

## Vercel

`yarn vercel` (preview) or `yarn vercel --prod`, after `yarn vercel:login`. Vercel sets `VERCEL_PROJECT_PRODUCTION_URL`, so metadata gets the right origin without extra config. `yarn vercel:yolo --prod` ships even with TypeScript errors (`NEXT_PUBLIC_IGNORE_BUILD_ERROR=true`): use it only when the user asks for it.

## ENS

Point an ENS name at the release by setting its contenthash to `ipfs://<CID>` (in the ENS app, or on-chain via the resolver). That's a mainnet transaction from the name's owner: do it only after the user has reviewed the gateway URL and approved that CID.

## Done When

Run each check and report what you saw:

1. `out/index.html`, `out/debug/index.html` and `out/blockexplorer/index.html` exist (one `index.html` per route)
2. `grep -o 'og:image" content="[^"]*' out/index.html` shows the production origin, not `localhost`
3. The CID is reported. A CID unchanged from the previous release means the uploaded bytes are identical: recheck the build before blaming gateway caching
4. Both `https://community.bgipfs.com/ipfs/<CID>/` and `.../ipfs/<CID>/debug/` return 200 (`curl -s -o /dev/null -w "%{http_code}" -L <url>`): a working root doesn't prove the other routes resolve
5. For ENS: the name's contenthash resolves to the approved CID, and the site loads through an ENS gateway (`https://<name>.eth.limo`)
