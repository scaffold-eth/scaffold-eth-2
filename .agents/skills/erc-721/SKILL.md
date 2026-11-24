---
name: erc-721
description: "Use when writing or changing an NFT (ERC-721) contract: minting, token metadata, on-chain SVG."
---

# ERC-721 NFT Integration for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

Also read `.agents/skills/openzeppelin/SKILL.md`: ERC-721 contracts build on OpenZeppelin, and that skill covers reading the installed source for the correct imports, override points and constructor patterns. The notes below match OpenZeppelin Contracts 5.x.

## `_safeMint` Reentrancy

`_safeMint` and `safeTransferFrom` call `onERC721Received()` on the recipient if it's a contract. That external call happens **after** the token is minted, so the recipient can re-enter your contract before the rest of your function runs. In the HypeBears exploit (Feb 2022), a state update after `_safeMint` let the attacker bypass the per-address mint limit.

```solidity
// VULNERABLE: state update after _safeMint
function mintNFT() public {
    require(!addressMinted[msg.sender], "Already minted");
    _safeMint(msg.sender, tokenId);
    addressMinted[msg.sender] = true;  // too late
}

// SAFE: state update before _safeMint (checks-effects-interactions)
function mintNFT() public {
    require(!addressMinted[msg.sender], "Already minted");
    addressMinted[msg.sender] = true;  // update first
    _safeMint(msg.sender, tokenId);
}
```

Update all state (counters, limits, payments) before `_safeMint`. For complex mint functions, also add OpenZeppelin's `nonReentrant` modifier (`ReentrancyGuard`, or `ReentrancyGuardTransient` on chains with EIP-1153). Use `_mint` instead if the recipient doesn't need the `onERC721Received` check.

## Token Metadata

**Base URI trailing slash.** OpenZeppelin's `tokenURI()` returns `_baseURI() + tokenId.toString()`, so a base URI of `ipfs://QmCID` turns token 42 into `ipfs://QmCID42` instead of `ipfs://QmCID/42`. End it with `/`. (If `_baseURI()` is empty, `tokenURI()` returns an empty string.)

**Marketplace `attributes`.** The `attributes` array isn't part of the ERC-721 EIP, but it's the de facto standard marketplaces (OpenSea, Blur, etc.) use to show traits; without it, traits don't display:

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

For fully on-chain metadata, return `"data:application/json;base64,"` + the Base64-encoded JSON from `tokenURI` (OpenZeppelin's `Base64` in `@openzeppelin/contracts/utils/Base64.sol`).

## On-Chain SVG and "Stack too deep"

A function's parameters, return values and locals share the 16 reachable stack slots, so building a whole SVG in one function (many string locals plus one big `string.concat`) fails with `Stack too deep`. Split it into helper functions that each return one fragment (`_background(seed)`, `_circle(seed >> 24)`, `_label(tokenId)`) and concatenate their results. The alternative is the IR pipeline: `viaIR: true` in the compiler `settings` of `packages/hardhat/hardhat.config.ts`, or `via_ir = true` in `packages/foundry/foundry.toml`; it applies to every contract and makes compilation noticeably slower.

## Combining Extensions

Combining `ERC721` with `ERC721Enumerable` and/or `ERC721URIStorage` requires explicit overrides of the functions both parents define (`_update`, `_increaseBalance`, `tokenURI`, `supportsInterface`). The compiler error names each one and the parents to list in its `override(...)`.

## Done When

Run each check and report what you saw:

1. `yarn compile` passes
2. Every mint function updates its state (counters, limits, payments) before `_safeMint`, or is `nonReentrant`
3. After minting a token on the local chain (`yarn deploy`, then mint from the Debug Contracts page), `tokenURI` returns the expected URI or `data:` JSON, including `attributes` if the collection has traits
