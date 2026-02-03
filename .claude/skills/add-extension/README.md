# /add-extension - SE-2 Extension Merger

Claude Code skill for adding Scaffold-ETH-2 extensions to existing projects post-creation.

**Requirements:** SE-2 project root, Git, Yarn

## Quick Start

```bash
# In SE-2 project root
/add-extension erc-20

# Preview changes first
/add-extension subgraph --dry-run

# Skip confirmation prompts
/add-extension ponder --yes
```

## Options

| Flag | Short | Description |
|------|-------|-------------|
| `--list` | `-L` | List all available extensions with repo info |
| `--dry-run` | `-d` | Preview changes without applying |
| `--yes` | `-y` | Skip confirmation prompts |
| `--verbose` | `-v` | Show detailed error messages |
| `--local <path>` | `-l` | Use local extension repo path |
| `--solidity-framework <name>` | `-s` | Choose hardhat/foundry (only if project has neither) |

## Available Extensions

Fetched dynamically from [create-eth](https://github.com/scaffold-eth/create-eth/blob/main/src/extensions/create-eth-extensions.ts):

Run `/add-extension --list` for current list with repository details.

## How It Works

1. **Validate** - Checks for SE-2 project (scaffold.config.ts)
2. **Registry** - Fetches extension config (repository URL, branch) from [create-eth](https://github.com/scaffold-eth/create-eth/blob/main/src/extensions/index.ts)
3. **Fetch** - Clones extension branch from the repository defined in registry
4. **Framework** - Auto-detects hardhat/foundry from project
5. **Analyze** - Compares extension files vs project
6. **Merge** - Copies new files, merges package.json, prompts for conflicts

### Framework Handling

| Project State | Behavior |
|---------------|----------|
| Has Hardhat | Uses Hardhat files automatically |
| Has Foundry | Uses Foundry files automatically |
| Has neither | Prompts or uses `-s` flag |
| Flag mismatch | Errors (won't install wrong framework) |

### File Handling

| File Type | Action |
|-----------|--------|
| New files | Copied directly |
| package.json | Auto-merged (deps, scripts) |
| `.args.mjs` files | Template-based merge |
| Other conflicts | Manual merge (Claude assists) |

## Architecture

```
skill.mjs          → CLI entry point
lib/validator.mjs  → SE-2 detection, registry fetching
lib/fetcher.mjs    → Git clone / local path handling
lib/analyzer.mjs   → File diff, framework detection
lib/merger.mjs     → Apply changes, package.json merge
lib/templateMerger.mjs → .args.mjs / .template.mjs processing
```

## Example Output

```
🏗️  Scaffold-ETH-2 Extension Merger
Adding extension: erc-20

✓ Detected SE-2 project (hardhat)
✓ Fetched extension (8 files)

Extension Changes Summary:

New files (3):
  + packages/hardhat/contracts/SE2Token.sol
  + packages/hardhat/deploy/01_deploy_se2_token.ts
  + packages/nextjs/app/erc20/page.tsx

Files to merge via .args.mjs (2):
  ~ README.md
  ~ packages/nextjs/components/Header.tsx

📝 Applying changes...

==================================================
Extension "erc-20" merge complete!
==================================================

✓ Applied: 5 files

Next steps:
  1. Test your application
  2. Commit changes
```

## Development

```bash
# Test locally with dry-run
node .claude/skills/add-extension/skill.mjs erc-20 --dry-run

# Test with local extension repo
/add-extension erc-721 --local ../create-eth-extensions --dry-run
```

## Source Repositories

| Repo | Purpose |
|------|---------|
| [create-eth](https://github.com/scaffold-eth/create-eth) | SE-2 CLI, extension registry (defines repo+branch for each extension) |
| [create-eth-extensions](https://github.com/scaffold-eth/create-eth-extensions) | Default extension source (each extension = git branch) |

Extensions are fetched from whatever repository is defined in the registry.
