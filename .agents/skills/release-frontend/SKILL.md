---
name: release-frontend
description: "Use when deploying, hosting or publishing the frontend/website (not contracts): IPFS (`yarn ipfs`), Vercel, or an ENS name."
---

# Shipping a Scaffold-ETH 2 Frontend

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

Before building, `targetNetworks` in `scaffold.config.ts` must list the live chain(s) the contracts are deployed to, and `deployedContracts.ts` / `externalContracts.ts` must hold those chains' addresses. A build pointed at `chains.hardhat` / `chains.foundry` ships fine and then shows nothing.

Set `NEXT_PUBLIC_ALCHEMY_API_KEY` and `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` too (in the shell or `.env.local` for IPFS, in the project env on Vercel). Without them the build silently uses SE-2's shared, rate-limited defaults from `scaffold.config.ts`: the site works at release and degrades later.

## IPFS

```bash
cd packages/nextjs
rm -rf .next out # stale .next/dev types and old out/ files survive otherwise
NEXT_PUBLIC_PRODUCTION_URL="https://<production-domain>" yarn ipfs
```

`yarn ipfs` builds the static export (`NEXT_PUBLIC_IPFS_BUILD=true` turns it on in `next.config.ts`), uploads `out/` to BuidlGuidl IPFS and prints `https://community.bgipfs.com/ipfs/<CID>`. It always exits 0: success is the `🚀 Upload complete` line with the CID, and `❌ Upload failed` means it failed. Without `NEXT_PUBLIC_PRODUCTION_URL`, Open Graph and Twitter metadata point at `http://localhost:3000` (`utils/scaffold-eth/getMetadata.ts`).

The upload needs a bgipfs API key (https://www.bgipfs.com) or a per-upload USDC payment; without either it fails with "Payment required". Never set either up yourself, enter keys or pay: give the user these commands to run in their own terminal, from the repo root. To pay from the `yarn account` wallet (or a dedicated low-balance one; each upload is capped at 0.05 USDC by default), which needs USDC on the chain the error names:

```bash
cd packages/nextjs
# `config init` never overwrites an existing config, and `yarn ipfs` creates one without payment; keep a backup (e.g. of an API-key setup)
if [ -f ipfs-upload.config.json ]; then mv -n ipfs-upload.config.json ipfs-upload.config.json.bak; fi
# Hardhat only (Foundry: skip this and use --keystore scaffold-eth-custom below). Copies the encrypted keystore
# to ~/.foundry/keystores/se2-deployer, which the config references by name; it never overwrites, so pick
# another name for a second project, and re-create it after changing accounts
(cd ../hardhat && node -e 'require("dotenv").config({quiet:true});const k=process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;if(!k)throw new Error("No deployer account: run yarn generate or yarn account:import");const fs=require("fs"),d=require("os").homedir()+"/.foundry/keystores";fs.mkdirSync(d,{recursive:true,mode:0o700});fs.writeFileSync(d+"/se2-deployer",k,{flag:"wx",mode:0o600})')
yarn bgipfs upload config init --keystore se2-deployer
# `yarn ipfs` captures the upload output, so bgipfs can't prompt; an empty value counts as unset
read -rsp "Keystore password: " BGIPFS_KEYSTORE_PASSWORD; echo; export BGIPFS_KEYSTORE_PASSWORD
NEXT_PUBLIC_PRODUCTION_URL="https://<production-domain>" yarn ipfs
unset BGIPFS_KEYSTORE_PASSWORD
```

If it fails with "the configured payment was not accepted", nothing was charged: retry the upload once before changing the setup.

What a static export can't serve:

- **API routes** (`app/api/**`, e.g. from the siwe, x402 or drizzle-neon skills): the export build fails. Host those on a server (Vercel) instead.
- **Dynamic routes** (`/blockexplorer/address/[address]`, `/blockexplorer/transaction/[txHash]`): only the placeholder path from `generateStaticParams` is exported, so opening any other address or transaction URL directly returns 404.

## Vercel

`yarn vercel` (preview) or `yarn vercel --prod`, after `yarn vercel:login`. Vercel sets `VERCEL_PROJECT_PRODUCTION_URL`, so metadata gets the right origin without extra config. `yarn vercel:yolo --prod` ships even with TypeScript errors (`NEXT_PUBLIC_IGNORE_BUILD_ERROR=true`): use it only when the user asks for it.

## ENS

Point an ENS name at the release by setting its contenthash to `ipfs://<CID>` (in the ENS app, or on-chain via the resolver). That's a mainnet transaction the user sends from the name's owner account, never you: hand it over only after the user has reviewed the gateway URL and approved that CID.

## Done When

Run each check and report what you saw:

1. `out/index.html`, `out/debug/index.html` and `out/blockexplorer/index.html` exist (one `index.html` per route)
2. `grep -o 'og:image" content="[^"]*' out/index.html` shows the production origin, not `localhost`
3. The CID is reported. A CID unchanged from the previous release means the uploaded bytes are identical: recheck the build before blaming gateway caching
4. Both `https://community.bgipfs.com/ipfs/<CID>/` and `.../ipfs/<CID>/debug/` return 200 (`curl -s -o /dev/null -w "%{http_code}" -L <url>`): a working root doesn't prove the other routes resolve
5. For ENS: the name's contenthash resolves to the approved CID, and the site loads through an ENS gateway (`https://<name>.eth.limo`)
