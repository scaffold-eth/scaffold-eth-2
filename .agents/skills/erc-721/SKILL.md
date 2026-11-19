---
name: erc-721
description: "Add an ERC-721 NFT contract to a Scaffold-ETH 2 project. Use when the user wants to: create an NFT collection, deploy an ERC-721, add NFT minting, build an NFT gallery or transfer UI, or work with non-fungible tokens in SE-2."
---

# ERC-721 NFT Integration for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

Also read `.agents/skills/openzeppelin/SKILL.md`: ERC-721 contracts build on OpenZeppelin, and that skill covers reading the installed source for the correct imports, override points and constructor patterns. The snippets below match OpenZeppelin Contracts 5.x.

## Gotchas

Key pitfalls to watch for when working with ERC-721.

### 1. `_safeMint` Reentrancy

`_safeMint` and `safeTransferFrom` call `onERC721Received()` on the recipient if it's a contract. That external call happens **after** the token is minted, so the recipient can re-enter your contract before the rest of your function runs.

**Real exploit (HypeBears, Feb 2022):** a state update after `_safeMint` let the attacker re-enter and bypass the per-address mint limit.

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

### 2. On-Chain SVG: "Stack too deep"

The EVM can only access the top 16 stack slots, and a function's parameters, return values and local variables all use them — so building a whole SVG in one function (many string locals plus a big `abi.encodePacked` / `string.concat`) easily fails with `Stack too deep`.

**Preferred fix: split the SVG into helper functions**, each returning one fragment, so no single function holds many values:

```solidity
using Strings for uint256; // import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

function _svg(uint256 tokenId) internal pure returns (string memory) {
    uint256 seed = uint256(keccak256(abi.encodePacked(tokenId)));
    return string.concat(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">',
        _background(seed),
        _circle(seed >> 24),
        _label(tokenId),
        "</svg>"
    );
}

function _circle(uint256 seed) internal pure returns (string memory) {
    return string.concat(
        '<circle cx="', (seed % 300).toString(),
        '" cy="', ((seed >> 8) % 300).toString(),
        '" r="', ((seed >> 16) % 80).toString(), '"/>'
    );
}

// _background and _label follow the same pattern
```

**Alternative: compile with the IR pipeline**, which can move variables to memory. In Hardhat, add `viaIR: true` to the compiler `settings` in `packages/hardhat/hardhat.config.ts` (next to `optimizer`); in Foundry, set `via_ir = true` in `packages/foundry/foundry.toml`. It applies to every contract and makes compilation noticeably slower, so prefer the refactor when it's simple.

### 3. Marketplace Metadata `attributes` Array

The `attributes` array in the metadata JSON isn't part of the ERC-721 EIP, but it's the de facto standard marketplaces (OpenSea, Blur, etc.) use to show traits. Without it, traits won't display:

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

For fully on-chain metadata, return `"data:application/json;base64,"` + the Base64-encoded JSON from `tokenURI` (OpenZeppelin's `Base64` library in `@openzeppelin/contracts/utils/Base64.sol`).

### 4. Required Overrides When Combining Extensions

When two parents define the same function, Solidity requires an explicit override listing both. For `ERC721` + `ERC721Enumerable`:

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

Adding `ERC721URIStorage` (per-token URIs via `_setTokenURI`) also requires overriding `tokenURI`, and adding it to the `supportsInterface` list:

```solidity
function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
}

function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
    return super.supportsInterface(interfaceId);
}
```

The compiler error names exactly which functions and parents are missing — or generate the full combination with the [OpenZeppelin Wizard](https://wizard.openzeppelin.com/#erc721).

### 5. IPFS Base URI Trailing Slash

OpenZeppelin's `tokenURI()` returns `_baseURI() + tokenId.toString()`. If the base URI is `ipfs://QmCID` without a trailing slash, token 42 becomes `ipfs://QmCID42` instead of `ipfs://QmCID/42`. (If `_baseURI()` is empty, `tokenURI()` returns an empty string.)
