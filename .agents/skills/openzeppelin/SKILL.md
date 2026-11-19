---
name: openzeppelin
description: "Develop smart contracts using OpenZeppelin Contracts library. Use when the user wants to create or modify Solidity contracts that use OpenZeppelin — including token standards (ERC20, ERC721, ERC1155), access control (Ownable, AccessControl), security primitives (Pausable, ReentrancyGuard), or any OZ extension. Covers library-first integration, pattern discovery from installed source, and version-safe development."
---

# Develop Smart Contracts with OpenZeppelin

Adapted from [OpenZeppelin's official skill](https://github.com/OpenZeppelin/openzeppelin-skills) (`develop-secure-contracts`) for Scaffold-ETH 2 Solidity projects.

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first. Check which flavor it is (Hardhat or Foundry) as described in `AGENTS.md`.

## Core Principle: Prefer Library Components Over Custom Code

Before writing ANY contract logic, look for an existing component in the installed OpenZeppelin library:

1. **Exact match exists?** Import and use it directly — inherit, override only what's needed
2. **Close match exists?** Import and extend — override only functions the library marks as `virtual`
3. **No match?** Only then write custom logic. Confirm by browsing the library's directory first

**Never hand-write what the library already provides:**
- Don't write `require(totalSupply() + amount <= cap)` when `ERC20Capped` exists
- Don't write `require(msg.sender == owner)` when `Ownable` exists
- Don't implement token transfer hooks manually when the library's base contracts handle it
- Don't copy library source into your contract — always import from the dependency so the project gets security updates

Before changing anything, read the project's existing contracts and integrate into them ("add pausability" means modify the current contract, not write a new one).

## Pattern Discovery: Read the Installed Source

APIs, override points, and import paths change between major versions (e.g. v5 replaced `_beforeTokenTransfer`/`_afterTokenTransfer` with a single `_update`). Don't assume patterns from memory — verify against the installed source.

### Step 1: Find the installed version and browse the library

- **Hardhat**: the source is in `packages/hardhat/node_modules/@openzeppelin/contracts/` (SE-2's Yarn config keeps dependencies per workspace; if it's not there, check the root `node_modules/`). Read the **installed** version from that folder's `package.json` — the range in `packages/hardhat/package.json` (e.g. `^5.6.1`) can resolve to a newer release.
- **Foundry**: the source is in `packages/foundry/lib/openzeppelin-contracts/contracts/` (version in `lib/openzeppelin-contracts/package.json`), mapped by `@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts` in `packages/foundry/remappings.txt`.

Key directories inside the OZ contracts root:
- `token/{ERC20,ERC721,ERC1155}/` — token standards and their base implementations
- `token/{ERC20,ERC721,ERC1155}/extensions/` — Capped, Burnable, Pausable, Permit, Votes, Enumerable, URIStorage, etc.
- `access/` — Ownable, AccessControl, `manager/` (AccessManager)
- `utils/` — ReentrancyGuard, Pausable, cryptography (ECDSA, MerkleProof), math, structs
- `governance/`, `account/`, `proxy/` — Governor and timelocks, account abstraction, proxies

### Step 2: Read the source file for the component you need

Look at:
- **Import syntax**: mirror how the library's own files import each other. OZ v5 uses named imports:
  ```solidity
  // ✅ import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
  // ❌ import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
  ```
- **`virtual` functions**: only these can be overridden, and that can change between versions
- **Constructor parameters**: what must be passed during deployment (e.g. v5's `Ownable(initialOwner)`)
- **NatSpec comments**: notes like `NOTE: This function is not virtual, {X} should be overridden instead` — follow them
- **Tests and mocks** show correct usage when the NatSpec isn't enough. They're in the [GitHub repo](https://github.com/OpenZeppelin/openzeppelin-contracts) (`test/`, `contracts/mocks/`) and in Foundry's `lib/openzeppelin-contracts/`, but not in the npm package

### Step 3: Extract the minimal integration pattern

From the source, identify only what's needed:
- Imports to add
- Inheritance chain
- Constructor parameters and chaining
- Required overrides (when two parents define the same function, override it listing both and call `super`)
- New functions to expose

### Step 4: Apply to the user's contract

Integrate into the existing code. Check for conflicts: duplicate access control, incompatible inheritance, missing overrides — the compiler errors name exactly which functions and parents need an explicit override.

## Reference Generator

For standard contracts (ERC20, ERC721, ERC1155, Governor, etc.), the [OpenZeppelin Wizard](https://wizard.openzeppelin.com/) generates the canonical combination of imports, inheritance and overrides. A useful trick: generate the contract without and with a feature, compare the two, and apply only the difference to the user's contract. The Wizard targets the latest OZ release, so still check the output against the installed version.

## SE-2 Integration Notes

- `@openzeppelin/contracts` is pre-installed in both flavors. For other OZ packages (e.g. `@openzeppelin/contracts-upgradeable`): `yarn workspace @se-2/hardhat add <package>` in Hardhat; `forge install OpenZeppelin/<repo>` plus a line in `remappings.txt` in Foundry
- Contracts: `packages/hardhat/contracts/` (Hardhat) or `packages/foundry/contracts/` (Foundry)
- Deploy scripts: `packages/hardhat/deploy/` (Hardhat) or `packages/foundry/script/` (Foundry)
- The frontend reads ABIs from `packages/nextjs/contracts/deployedContracts.ts`, regenerated by `yarn deploy` — redeploy after changing a contract's interface
