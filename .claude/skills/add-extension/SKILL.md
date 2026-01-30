---
name: add-extension
description: Merge a scaffold-eth extension into the current project
disable-model-invocation: false
allowed-tools: Bash, Read
user-invocable: true
---

Merge the $0 extension into this Scaffold-ETH-2 project using the add-extension merger tool.

Steps:
1. Validate we're in an SE-2 project root
2. Run the merger script: `node .claude/skills/add-extension/skill.mjs $0 $@`
3. Review the output and report any issues
4. For .args files when manual change needed: ask yes/no to auto-merge with suggested changes
5. Summarize what was added/modified
6. After all merges complete (including manual), ask if user wants to run `yarn install` if dependencies changed

Workflow notes:
- Don't ask permission for changes in `.tmp` folder
- If manual inspection of extension files needed, use `.claude/skills/add-extension/.tmp`, NOT `/tmp`

Available options to pass through:
- --dry-run: Preview changes only
- --force: Reinstall if already installed
- -s, --solidity-framework hardhat|foundry: Choose framework (only used if project has neither)
- --local <path>: Use local extension repo
- --verbose: Show detailed errors

Framework selection:
- If project has hardhat → uses hardhat from extension (no prompt)
- If project has foundry → uses foundry from extension (no prompt)
- If project has neither → prompts for framework choice or uses -s/--solidity-framework flag
- Cannot install different framework than what project already has

Examples:
- /add-extension erc-20 -s hardhat
- /add-extension subgraph --dry-run
- /add-extension ponder --solidity-framework hardhat
