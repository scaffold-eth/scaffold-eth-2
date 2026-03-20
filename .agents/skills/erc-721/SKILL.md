---
name: erc-721
description: "Add an ERC-721 NFT contract to a Scaffold-ETH 2 project. Use when the user wants to: create an NFT collection, deploy an ERC-721, add NFT minting, build an NFT gallery or transfer UI, or work with non-fungible tokens in SE-2."
---

# ERC-721 NFT Integration for Scaffold-ETH 2

## Prerequisites

Check if `./packages/nextjs/scaffold.config.ts` exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

Also read `.agents/skills/openzeppelin/SKILL.md` since ERC-721 contracts use OpenZeppelin, and that skill has critical guidance on reading the installed source for correct import syntax, override points, and constructor patterns.

## Gotchas

Key pitfalls and gotchas to watch for when working with ERC-721.

### 1. `_safeMint` Reentrancy

`_safeMint` and `safeTransferFrom` invoke `onERC721Received()` on the recipient if it's a contract. This is an external call **after** the token has been minted, creating a reentrancy vector.

**Real exploit (HypeBears, Feb 2022):** State updated after `_safeMint` allowed attacker to re-enter and bypass per-address minting limits.

```solidity
// VULNERABLE: state update after _safeMint
function mintNFT() public {
    require(!addressMinted[msg.sender], "Already minted");
    _safeMint(msg.sender, tokenId);
    addressMinted[msg.sender] = true;  // too late
}

// SAFE: state update before _safeMint
function mintNFT() public {
    require(!addressMinted[msg.sender], "Already minted");
    addressMinted[msg.sender] = true;  // update first
    _safeMint(msg.sender, tokenId);
}
```

### 2. On-Chain SVG Stack-Too-Deep

When generating SVG on-chain, the `tokenURI` or `generateSVG` function easily hits Solidity's 16-local-variable stack limit. Split SVG generation into multiple helper functions (e.g., `_svgBackground`, `_svgShapes`, `_svgText`) rather than building the entire SVG in one function.

### 3. Marketplace Metadata `attributes` Array

The `attributes` array in NFT metadata JSON is not in the ERC-721 EIP but is the de facto standard used by OpenSea, Blur, and every marketplace. Without it, traits won't display:

```json
{
  "name": "My NFT #1",
  "description": "...",
  "image": "data:image/svg+xml;base64,...",
  "attributes": [
    { "trait_type": "Color", "value": "Blue" },
    { "trait_type": "Rarity", "value": "Rare" }
  ]
}
```

### 4. Required Overrides with ERC721Enumerable

When combining `ERC721` + `ERC721Enumerable`, both define `_update` and `_increaseBalance`. You must explicitly override them or the contract won't compile:

```solidity
function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
    return super._update(to, tokenId, auth);
}

function _increaseBalance(address account, uint128 amount) internal override(ERC721, ERC721Enumerable) {
    super._increaseBalance(account, amount);
}

function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
    return super.supportsInterface(interfaceId);
}
```

### 5. IPFS Base URI Trailing Slash

OpenZeppelin's `tokenURI()` concatenates `_baseURI() + tokenId.toString()`. If the base URI is `ipfs://QmCID` without a trailing slash, token 42 becomes `ipfs://QmCID42` instead of `ipfs://QmCID/42`.
