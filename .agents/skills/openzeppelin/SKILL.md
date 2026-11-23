---
name: openzeppelin
description: "Use when writing or changing a Solidity contract that uses OpenZeppelin: tokens (ERC20, ERC721, ERC1155), access control, pausing, reentrancy guards or any other OZ component."
---

# Develop Smart Contracts with OpenZeppelin

Adapted from [OpenZeppelin's official skill](https://github.com/OpenZeppelin/openzeppelin-skills) (`develop-secure-contracts`) for Scaffold-ETH 2 Solidity projects.

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first. Check which flavor it is (Hardhat or Foundry) as described in `AGENTS.md`.

## Core Principle: Library First

Build each feature from the installed OpenZeppelin library, and write custom logic only for what it doesn't provide:

1. **Exact match?** Import it and inherit, overriding only what's needed
2. **Close match?** Import and extend, overriding only functions the library marks `virtual`
3. **No match?** Write custom logic, after browsing the library to confirm

For example: a supply cap is `ERC20Capped`, owner-only functions are `Ownable` (or `AccessControl` for several roles), and per-transfer logic goes in an override of `_update`. Always import from the dependency rather than copying its source, so the project gets security updates.

Integrate into the project's existing contracts: "add pausability" means changing the current contract, not writing a new one.

## Pattern Discovery: Read the Installed Source

APIs, override points and import paths change between major versions (e.g. v5 replaced `_beforeTokenTransfer`/`_afterTokenTransfer` with a single `_update`), so verify against the installed source rather than memory.

1. **Find the installed version and source:**
   - **Hardhat**: `packages/hardhat/node_modules/@openzeppelin/contracts/` (SE-2's Yarn config keeps dependencies per workspace; if it's not there, check the root `node_modules/`). Read the **installed** version from that folder's `package.json`: the range in `packages/hardhat/package.json` (e.g. `^5.6.1`) can resolve to a newer release.
   - **Foundry**: `packages/foundry/lib/openzeppelin-contracts/contracts/` (version in `lib/openzeppelin-contracts/package.json`), mapped by `@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts` in `packages/foundry/remappings.txt`.
2. **Read the source file of each component you use**, for:
   - **Import syntax**: OZ v5 uses named imports (`import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";`); mirror how the library's own files import each other
   - **`virtual` functions**: only these can be overridden, and that can change between versions
   - **Constructor parameters**: what must be passed at deployment (e.g. v5's `Ownable(initialOwner)`)
   - **NatSpec notes** like `NOTE: This function is not virtual, {X} should be overridden instead`: follow them
   - **Tests and mocks**, when the NatSpec isn't enough: in the [GitHub repo](https://github.com/OpenZeppelin/openzeppelin-contracts) (`test/`, `contracts/mocks/`) and in Foundry's `lib/openzeppelin-contracts/`, but not in the npm package
3. **Apply the minimal change** to the user's contract: imports, inheritance, constructor chaining, and the required overrides. When two parents define the same function, the compiler error names it and both parents: override it listing them and call `super`.

## Other OZ Packages

`@openzeppelin/contracts` is pre-installed in both flavors. For others (e.g. `@openzeppelin/contracts-upgradeable`): `yarn workspace @se-2/hardhat add <package>` in Hardhat; `forge install OpenZeppelin/<repo>` plus a line in `remappings.txt` in Foundry.

## Done When

Run each check and report what you saw:

1. `yarn compile` passes
2. Each feature comes from an OZ component where one exists, imported from the installed package (no copied library source)
3. After `yarn deploy`, the new or changed functions behave as expected when called from the Debug Contracts page or a test (e.g. `pause()` blocks transfers, a non-owner call reverts)
