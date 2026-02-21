---
name: erc-721
description: "Add an ERC-721 NFT contract to a Scaffold-ETH 2 project. Use when the user wants to: create an NFT collection, deploy an ERC-721, add NFT minting, build an NFT gallery or transfer UI, or work with non-fungible tokens in SE-2."
---

# ERC-721 NFT Integration for Scaffold-ETH 2

## Prerequisites

This skill is designed for Scaffold-ETH 2 (SE-2) projects. If the user is **not already inside an SE-2 project**, use the `ethereum-app-builder` skill from this same skill package to scaffold one first, then come back here to add ERC-721.

How to check: look for `packages/nextjs/` and either `packages/hardhat/` or `packages/foundry/` in the project root, along with a root `package.json` with SE-2 workspace scripts (`yarn chain`, `yarn deploy`, `yarn start`).

## Overview

[ERC-721](https://eips.ethereum.org/EIPS/eip-721) is the standard interface for non-fungible tokens (NFTs) on Ethereum. This skill covers adding an ERC-721 contract to a Scaffold-ETH 2 project using [OpenZeppelin's ERC-721 implementation](https://docs.openzeppelin.com/contracts/5.x/erc721), along with deployment scripts and a frontend for minting, listing, and transferring NFTs.

For anything not covered here, refer to the [OpenZeppelin ERC-721 docs](https://docs.openzeppelin.com/contracts/5.x/api/token/erc721) or search the web. This skill focuses on what's hard to discover: SE-2 integration specifics, common pitfalls, and ERC-721 gotchas.

## SE-2 Project Context

Scaffold-ETH 2 (SE-2) is a yarn (v3) monorepo for building dApps on Ethereum. It comes in two flavors based on the Solidity framework:

- **Hardhat flavor**: contracts at `packages/hardhat/contracts/`, deploy scripts at `packages/hardhat/deploy/`
- **Foundry flavor**: contracts at `packages/foundry/contracts/`, deploy scripts at `packages/foundry/script/`

Check which exists in the project to know the flavor. Both flavors share:

- **`packages/nextjs/`**: React frontend (Next.js App Router, Tailwind + DaisyUI, RainbowKit, Wagmi, Viem). Uses `~~` path alias for imports.
- **`packages/nextjs/contracts/deployedContracts.ts`**: auto-generated after `yarn deploy`, contains ABIs, addresses, and deployment block numbers for all contracts, keyed by chain ID.
- **`packages/nextjs/scaffold.config.ts`**: project config including `targetNetworks` (array of viem chain objects).
- **Root `package.json`**: monorepo scripts that proxy into workspaces (e.g. `yarn chain`, `yarn deploy`, `yarn start`).

SE-2 uses `@scaffold-ui/components` for blockchain/Ethereum components (addresses, balances, etc.) and DaisyUI + Tailwind for general component and styling.

The deployment scripts go alongside the existing deploy scripts, and the frontend page goes in the nextjs package. After deployment, `deployedContracts.ts` auto-generates the ABI and address, so the frontend can interact with the NFT contract using SE-2's scaffold hooks (`useScaffoldReadContract`, `useScaffoldWriteContract`, `useScaffoldContract`).

Look at the actual project structure and contracts before setting things up. Adapt to what's there rather than following this skill rigidly.

## Dependencies

OpenZeppelin contracts are already included in SE-2's Hardhat and Foundry setups, so no additional dependency installation is needed. If for some reason they're missing:

- **Hardhat**: `@openzeppelin/contracts` in `packages/hardhat/package.json`
- **Foundry**: installed via `forge install OpenZeppelin/openzeppelin-contracts`, with remapping `@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/`

No new frontend dependencies are required.

## Smart Contract

The token contract extends OpenZeppelin's `ERC721` base. Import path: `@openzeppelin/contracts/token/ERC721/ERC721.sol`. The constructor takes a token name and symbol.

Syntax reference for a basic NFT with open minting and IPFS metadata:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract MyNFT is ERC721Enumerable {
    uint256 public tokenIdCounter;

    constructor() ERC721("MyNFT", "MNFT") {}

    function mintItem(address to) public returns (uint256) {
        tokenIdCounter++;
        _safeMint(to, tokenIdCounter);
        return tokenIdCounter;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_baseURI(), Strings.toString(tokenId));
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://YourCID/";
    }
}
```

Adapt the contract based on the user's requirements. Available extensions (all under `@openzeppelin/contracts/token/ERC721/extensions/`):

- **`ERC721Enumerable`**: on-chain enumeration of all tokens and per-owner tokens. Enables `totalSupply()`, `tokenByIndex()`, `tokenOfOwnerByIndex()`. Convenient but expensive (see gas section below).
- **`ERC721URIStorage`**: per-token URI storage via `_setTokenURI()`. Emits ERC-4906 `MetadataUpdate` events in v5.
- **`ERC721Burnable`**: lets token owners destroy their NFTs
- **`ERC721Pausable`**: admin can freeze all transfers
- **`ERC721Votes`**: governance checkpoints, each NFT = 1 vote
- **`ERC721Royalty`**: ERC-2981 royalty info (see royalties section below)
- **`ERC721Consecutive`**: batch minting during construction (ERC-2309)

See [OpenZeppelin's ERC-721 extensions](https://docs.openzeppelin.com/contracts/5.x/api/token/erc721#extensions) for the full list.

### OpenZeppelin v5 changes to be aware of

If referencing older tutorials or code, note these breaking changes in OpenZeppelin v5:

- **`_beforeTokenTransfer` and `_afterTokenTransfer` hooks are gone.** Replaced by a single `_update(address to, uint256 tokenId, address auth)` override point that handles mint, transfer, and burn.
- **Custom errors** replaced revert strings (e.g. `ERC721NonexistentToken`, `ERC721InsufficientApproval`)
- **`Ownable` requires explicit owner**: `Ownable(msg.sender)` instead of `Ownable()`
- **`ERC721URIStorage`** now emits ERC-4906 `MetadataUpdate` events when `_setTokenURI` is called

## Deployment

### Hardhat

Deploy script goes in `packages/hardhat/deploy/`. SE-2 uses `hardhat-deploy`, so the script exports a `DeployFunction`. Use a filename like `01_deploy_my_nft.ts` (numbered to control deploy order). The `autoMine` flag speeds up local deployments.

### Foundry

Add a deploy script in `packages/foundry/script/` and wire it into the main `Deploy.s.sol`. SE-2's Foundry setup uses a `ScaffoldETHDeploy` base contract and `DeployHelpers.s.sol`. Import and call the new deploy script from `Deploy.s.sol`'s run function.

## Metadata: The Part Most People Get Wrong

### The metadata JSON schema

ERC-721 metadata follows a standard JSON structure returned by `tokenURI()`:

```json
{
  "name": "My NFT #1",
  "description": "Description of the NFT",
  "image": "ipfs://QmImageCID",
  "attributes": [
    { "trait_type": "Color", "value": "Blue" },
    { "trait_type": "Rarity", "value": "Rare" }
  ]
}
```

The `attributes` array is not in the EIP but is the de facto standard used by OpenSea, Blur, and every other marketplace. Without it, traits won't display.

### On-chain vs off-chain metadata

| Factor | On-chain (base64/SVG) | Off-chain (IPFS/Arweave) |
|--------|----------------------|--------------------------|
| Permanence | Permanent as long as Ethereum exists | Depends on pinning/persistence |
| Gas cost | Very expensive (~128KB payload ceiling) | Cheap (just store a URI string) |
| Mutability | Immutable once deployed | Can disappear if unpinned |
| Best for | Small collections, generative art | Large collections, rich media |

### IPFS gotchas

About 20% of sampled NFTs have broken or expired metadata links. Common causes:

- **Unpinned data gets garbage collected.** IPFS nodes drop data nobody is actively pinning. If the original pinner stops, the data vanishes.
- **Gateway URLs vs protocol URIs.** Use `ipfs://QmCID` (content-addressed, portable) not `https://gateway.pinata.cloud/ipfs/QmCID` (depends on one gateway staying up).
- **Base URI must end with `/`.** OpenZeppelin's `tokenURI()` concatenates `_baseURI() + tokenId.toString()`. If the base URI is `ipfs://QmCID` without a trailing slash, token 42 becomes `ipfs://QmCID42` instead of `ipfs://QmCID/42`.
- **File naming.** If using base URI + token ID, metadata files must be named `0`, `1`, `2` etc. (no `.json` extension) unless you override `tokenURI()` to append it.

For permanent storage, consider [Arweave](https://www.arweave.org/) or a paid IPFS pinning service (Pinata, Filebase).

## ERC721Enumerable: Convenient but Expensive

ERC721Enumerable maintains four additional data structures that get updated on every mint and transfer. Concrete gas comparison:

- Minting 5 tokens with ERC721Enumerable: ~566,000 gas
- Minting 5 tokens with ERC721A: ~104,000 gas (5.5x cheaper)

**When to use it**: Small collections, learning/demos, when you need on-chain enumeration without an indexer.

**When to skip it**: Large collections (1k+ tokens), gas-sensitive mints. Use a simple counter for `totalSupply()` and index token ownership off-chain using `Transfer` events (via a subgraph or Ponder, both available as SE-2 skills).

### ERC721A as an alternative

[ERC721A](https://github.com/chiru-labs/ERC721A) by Azuki makes batch minting cost nearly the same as minting a single token. A 10-token mint costs ~110,000 gas vs ~1,100,000+ with ERC721Enumerable. It works by lazily initializing ownership: only the first token in a batch gets an ownership record, and later tokens infer ownership by scanning backwards.

Trade-offs:
- Requires sequential token IDs (no random IDs)
- First transfer after a batch mint is more expensive (must initialize ownership)
- Not an OpenZeppelin extension; separate dependency from `erc721a` npm package

## Security: The Reentrancy You Didn't Expect

### `_safeMint` and `safeTransferFrom` call external code

Both `_safeMint` and `safeTransferFrom` invoke `onERC721Received()` on the recipient if it's a contract. This is an external call that happens after the token has been minted/transferred, creating a reentrancy vector.

**Real exploit (HypeBears, Feb 2022):** The contract tracked per-address minting limits but updated state after `_safeMint`. An attacker's `onERC721Received` callback called `mintNFT` again before the limit was recorded, bypassing the per-address cap entirely.

```solidity
// VULNERABLE: state update after _safeMint
function mintNFT() public {
    require(!addressMinted[msg.sender], "Already minted");
    _safeMint(msg.sender, tokenId);          // calls onERC721Received on attacker
    addressMinted[msg.sender] = true;         // too late, attacker already re-entered
}

// SAFE: state update before _safeMint
function mintNFT() public {
    require(!addressMinted[msg.sender], "Already minted");
    addressMinted[msg.sender] = true;         // update state first
    _safeMint(msg.sender, tokenId);
}
```

Mitigations: Update state before `_safeMint`/`safeTransferFrom` (checks-effects-interactions pattern), or use OpenZeppelin's `ReentrancyGuard` (`nonReentrant` modifier).

### `setApprovalForAll` is a dangerous permission

`setApprovalForAll(operator, true)` grants an operator control over **all** of an owner's NFTs in that collection. Phishing attacks trick users into signing this for malicious operators. Once approved, the attacker can transfer away every NFT the victim owns. Most marketplaces require `setApprovalForAll` to list NFTs, which is why phishing is so effective.

### Flash loan governance attacks

NFTs used for governance (each NFT = 1 vote) can be manipulated via flash loans: borrow NFTs, vote, return them. Use `ERC721Votes` with checkpoints and voting delays rather than raw `balanceOf()` for governance.

## Royalties (ERC-2981)

ERC-2981 defines a standard `royaltyInfo(tokenId, salePrice)` function that returns the royalty receiver and amount. OpenZeppelin provides `ERC721Royalty` to implement this.

**The critical thing to know: ERC-2981 is advisory, not enforceable.** The standard provides an interface for querying royalty info, but nothing forces marketplaces to honor it. Anyone can transfer an NFT via `transferFrom` without paying royalties.

Current marketplace stance:
- **OpenSea**: ended mandatory enforcement Aug 2023. Added ERC-721C support Apr 2024 for opt-in on-chain enforcement.
- **Blur**: enforces only a 0.5% minimum on most collections.

[ERC-721C](https://github.com/limitbreak/creator-token-standards) by Limit Break attempted to solve this by restricting transfers to whitelisted operator contracts. Adoption is growing but not universal.

## Soulbound Tokens (ERC-5192)

For non-transferable NFTs (credentials, memberships, achievements), [ERC-5192](https://eips.ethereum.org/EIPS/eip-5192) adds a minimal `locked(tokenId)` interface. In OpenZeppelin v5, the simplest approach is overriding `_update`:

```solidity
function _update(address to, uint256 tokenId, address auth)
    internal override returns (address)
{
    address from = super._update(to, tokenId, auth);
    require(from == address(0) || to == address(0), "Non-transferable");
    return from;
}
```

## Well-Known NFT Contracts (Ethereum Mainnet)

| Collection | Address | Notes |
|------------|---------|-------|
| CryptoPunks (original) | `0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB` | **NOT ERC-721.** Pre-dates the standard (June 2017). Custom contract with its own marketplace built in. Had a critical bug where sale ETH was credited to the buyer, not the seller. |
| Wrapped CryptoPunks | `0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6` | ERC-721 wrapper around original punks |
| Bored Ape Yacht Club | `0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D` | 10,000 apes, standard ERC-721 |
| Azuki | `0xED5AF388653567Af2F388E6224dC7C4b3241C544` | Uses ERC721A for gas-optimized batch minting |
| Pudgy Penguins | `0xBd3531dA5CF5857e7CfAA92426877b022e612cf8` | 8,888 penguins |