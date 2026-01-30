---
name: add-extension
description: Merge a scaffold-eth extension into the current project
disable-model-invocation: false
allowed-tools: Bash, Read
user-invocable: true
---

Merge the `$0` extension into this Scaffold-ETH-2 project.

## Execution

Run the merger script:
```bash
node .claude/skills/add-extension/skill.mjs $0 $@
```

## Post-Merge Tasks

1. Review the output for any skipped files needing manual merge
2. If manual merges needed, help user resolve conflicts
3. Remind user to run `yarn install` if dependencies changed
4. Summarize what was added/modified

## Options

| Flag | Description |
|------|-------------|
| `--dry-run`, `-d` | Preview only |
| `--force`, `-f` | Reinstall if installed |
| `--yes`, `-y` | Skip prompts |
| `--verbose`, `-v` | Detailed errors |
| `--local`, `-l` | Local extension path |
| `-s`, `--solidity-framework` | Choose hardhat/foundry |

## Framework Selection

- Project has hardhat → uses hardhat files (no prompt)
- Project has foundry → uses foundry files (no prompt)
- Project has neither → prompts or uses `-s` flag
- Flag mismatch with project → errors

## Notes

- Temp files are in `.claude/skills/add-extension/.tmp`, not `/tmp`
- Don't ask permission for `.tmp` folder operations

## Examples

```bash
/add-extension erc-20
/add-extension subgraph --dry-run
/add-extension ponder -s hardhat --yes
```
