---
name: fork-demo
description: "Use when the app needs real chain state locally: forking mainnet or an L2, funding demo accounts with real tokens, or a live demo where deadlines, expiry or vesting must tick."
---

# Forked-Chain Demos for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Start the fork

Run `yarn fork` instead of `yarn chain`, then `yarn deploy` and `yarn start` as usual. The fork still runs at chain ID 31337, so `scaffold.config.ts` keeps `chains.hardhat` (Hardhat) or `chains.foundry` (Foundry) — switch `targetNetworks` to the real chain only for a real deployment.

- **Hardhat:** `yarn fork` always forks mainnet (`forking.url` under `networks.hardhat` in `hardhat.config.ts`). To fork another chain, change that URL.
- **Foundry:** `yarn fork --network <rpc-alias>` (an alias from `[rpc_endpoints]` in `foundry.toml`, default `mainnet`), e.g. `yarn fork --network optimism`. Without `--network`, `yarn fork optimism` silently forks mainnet.

**Hardhat: run `yarn deploy --reset` after every fork restart.** A fork's genesis block is the upstream chain's, so hardhat-deploy takes the new fork for the old one and "reuses" addresses that have no code on it. Foundry's `fork` target already clears its broadcast files.

Protocols already deployed on the forked chain go in `packages/nextjs/contracts/externalContracts.ts` **under key `31337`**, not the upstream chain ID; under the upstream ID, SE-2 hooks never find them on the fork.

## Fund demo accounts from real holders

Move existing tokens from a real holder rather than deploying a mock. Check the holder's balance first: a transfer larger than it reverts. These commands work on both Hardhat and Anvil (Hardhat rejects the `anvil_*` names, and rejects `cast send` / `cast call` because they send both `data` and `input` fields, so go through `cast rpc`):

```bash
RPC=http://127.0.0.1:8545
cast rpc --rpc-url $RPC hardhat_impersonateAccount <holder>
cast rpc --rpc-url $RPC hardhat_setBalance <holder> 0x56BC75E2D63100000 # 100 ETH for gas
cast rpc --rpc-url $RPC eth_sendTransaction \
  "{\"from\":\"<holder>\",\"to\":\"<token>\",\"data\":\"$(cast calldata 'transfer(address,uint256)' <demo-account> <amount>)\"}"
# Read a balance the same way
cast rpc --rpc-url $RPC eth_call \
  "{\"to\":\"<token>\",\"data\":\"$(cast calldata 'balanceOf(address)' <demo-account>)\"}" latest
```

`hardhat_setStorageAt` overrides balances directly when no suitable holder exists. Nothing is broadcast to the real chain.

## Keep time moving

Both local chains mine only when a transaction arrives, so `block.timestamp` stays frozen between transactions and then jumps. Countdowns, expiry and vesting UIs look broken even when `vm.warp` / `time.increase` tests pass. Enable interval mining for a live demo — **the unit differs per flavor**:

```bash
cast rpc --rpc-url http://127.0.0.1:8545 evm_setIntervalMining 1000 # Hardhat: milliseconds
cast rpc --rpc-url http://127.0.0.1:8545 evm_setIntervalMining 1    # Anvil: seconds (1000 = one block every ~17 min)
```

To make it permanent: Hardhat `mining: { interval: 1000 }` under `networks.hardhat`; Foundry `--block-time 1` on the `anvil` line of the `fork` target in `packages/foundry/Makefile`. `evm_mine` / `evm_increaseTime` advance time once and it freezes again: use them for single-step tests, not a running demo.

## Done When

With `yarn fork`, `yarn deploy` and `yarn start` running, run each check and report what you saw:

1. The frontend is connected to chain 31337, and each forked protocol's contract shows up on `/debug` (listed in `externalContracts.ts` under `31337`)
2. The demo account shows the transferred token balance in the UI
3. Two reads of `cast block latest -f timestamp` a few seconds apart, with no transaction in between, return different timestamps (if the demo depends on time)
