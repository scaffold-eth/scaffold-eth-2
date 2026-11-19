---
"create-eth": patch
---

Add `--skip-simulation` to non-localhost Foundry deploys so gas limits come from the node's `eth_estimateGas`. Forge simulates Ethereum chains with the `evm_version` from `foundry.toml` rather than the target chain's active fork, so deploys to Amsterdam chains (EIP-8037, e.g. Sepolia) ran out of gas. Note: skipping simulation makes the broadcast sequential and drops the pre-broadcast cost summary.
