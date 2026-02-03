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

1. Review output for skipped files needing manual merge
2. Help user resolve conflicts if any
3. Run `yarn install` only if dependencies were added
4. Summarize what was added

## On Failure

- If extension not found: suggest `--list` to see available extensions
- If not SE-2 project: confirm user is in project root

## Options

| Flag | Description |
|------|-------------|
| `--dry-run`, `-d` | Preview only |
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
