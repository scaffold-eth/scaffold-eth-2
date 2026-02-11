# /add-extension - SE-2 Extension Merger (Hybrid)

Claude Code skill for adding Scaffold-ETH-2 extensions to existing projects post-creation.

Uses a **hybrid approach**: a Node.js script handles deterministic operations (fetch, copy, package.json merge), while Claude handles intelligent file merging (.args.mjs processing).

**Requirements:** SE-2 project root, Git, Yarn

## Quick Start

```bash
# In SE-2 project root
/add-extension erc-20

# Preview changes first
/add-extension subgraph --dry-run

# Choose framework explicitly
/add-extension ponder -s hardhat
```

## Options

| Flag | Short | Description |
|------|-------|-------------|
| `--list` | `-L` | List all available extensions with repo info |
| `--dry-run` | `-d` | Preview changes without applying |
| `--verbose` | `-v` | Show detailed error messages |
| `--local <path>` | `-l` | Use local extension repo path |
| `--solidity-framework <name>` | `-s` | Choose hardhat/foundry (only if project has neither) |

## Available Extensions

Fetched dynamically from [create-eth](https://github.com/scaffold-eth/create-eth/blob/main/src/extensions/create-eth-extensions.ts).

Run `/add-extension --list` for current list with repository details.

## How It Works

1. **Validate** - Checks for SE-2 project (scaffold.config.ts)
2. **Registry** - Fetches extension config from create-eth registry
3. **Fetch** - Clones extension branch via git
4. **Framework** - Auto-detects hardhat/foundry from project
5. **Analyze** - Compares extension files vs project, reads .args.mjs as raw text
6. **Deterministic merge** - Script copies new files, merges package.json, registers workspaces
7. **AI merge** - Script outputs structured JSON tasks; Claude reads target files and applies .args.mjs exports intelligently

### File Handling

| File Type | Handler | Action |
|-----------|---------|--------|
| New files | Script | Copied directly |
| package.json | Script | Auto-merged (deps, scripts) |
| Workspaces | Script | Registered in root package.json |
| `.args.mjs` files | Claude | Reads exports, modifies target files |
| `.template.mjs` files | Claude | Extracts content, writes/merges target |
| File conflicts | Claude | Reads both versions, merges intelligently |

## Architecture

```
SKILL.md           - Skill instructions (comprehensive .args.mjs guide)
skill.mjs          - CLI entry point, orchestration, JSON output
lib/validator.mjs  - SE-2 detection, registry fetching
lib/fetcher.mjs    - Git clone / local path handling
lib/analyzer.mjs   - File categorization, .args.mjs raw reading
lib/merger.mjs     - Deterministic operations (copy, package.json merge)
lib/constants.mjs  - Registry URLs, fallback extensions
```

## Development

```bash
# Test locally with dry-run
node .agents/skills/add-extension/skill.mjs erc-20 --dry-run

# Test with local extension repo
/add-extension erc-721 --local ../create-eth-extensions --dry-run
```

## Source Repositories

| Repo | Purpose |
|------|---------|
| [create-eth](https://github.com/scaffold-eth/create-eth) | SE-2 CLI, extension registry |
| [create-eth-extensions](https://github.com/scaffold-eth/create-eth-extensions) | Default extension source (each extension = git branch) |
