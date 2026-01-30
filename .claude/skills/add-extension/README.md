# /add-extension - SE-2 Extension Merger

Claude Code skill for adding Scaffold-ETH-2 extensions to existing projects post-creation.

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
| `--dry-run` | `-d` | Preview changes without applying |
| `--force` | `-f` | Reinstall even if already installed |
| `--yes` | `-y` | Skip confirmation prompts |
| `--verbose` | `-v` | Show detailed error messages |
| `--local <path>` | `-l` | Use local extension repo path |
| `--solidity-framework <name>` | `-s` | Choose hardhat/foundry (only if project has neither) |

## Available Extensions

Fetched dynamically from [create-eth-extensions](https://github.com/scaffold-eth/create-eth/blob/main/src/extensions/create-eth-extensions.ts):

`subgraph`, `x402`, `eip-712`, `ponder`, `erc-20`, `eip-5792`, `randao`, `erc-721`, `porto`, `envio`, `drizzle-neon`

Run `/add-extension --help` for current list.

## How It Works

1. **Validate** - Checks for SE-2 project (scaffold.config.ts)
2. **Fetch** - Clones extension branch from `scaffold-eth/create-eth-extensions`
3. **Framework** - Auto-detects hardhat/foundry from project
4. **Analyze** - Compares extension files vs project
5. **Merge** - Copies new files, merges package.json, prompts for conflicts
6. **Track** - Records extension in `package.json` under `scaffoldEth.extensions`

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

## Extension Tracking

Installed extensions tracked in `package.json`:

```json
{
  "scaffoldEth": {
    "extensions": ["erc-20", "subgraph"]
  }
}
```

## Architecture

```
.claude/skills/add-extension/
├── skill.mjs              # Entry point & CLI
├── SKILL.md               # Claude skill definition
├── README.md              # This file
└── lib/
    ├── constants.mjs      # Shared constants (URLs, fallbacks)
    ├── templateUtils.mjs  # Shared utilities
    ├── validator.mjs      # SE-2 detection & extension validation
    ├── fetcher.mjs        # GitHub/local extension fetching
    ├── analyzer.mjs       # File diff & framework detection
    ├── merger.mjs         # File operations & package.json merge
    ├── extensionTracker.mjs  # Extension tracking & args loading
    ├── templateMerger.mjs # Template-based file generation
    └── create-eth-utils/  # Utils copied from create-eth
```

## Example Output

```
🏗️  Scaffold-ETH-2 Extension Merger
Adding extension: erc-20

✓ Detected SE-2 project (hardhat)
✓ Fetched extension (23 files)

Extension Changes Summary:

New files (5):
  + packages/nextjs/app/erc20/page.tsx
  + packages/hardhat/contracts/ERC20Token.sol

package.json changes:
  Dependencies:
    + @openzeppelin/contracts@^5.0.0
  Scripts:
    + deploy:erc20

📝 Applying changes...
✓ Tracked extension in package.json

==================================================
Extension "erc-20" merge complete!
==================================================

✓ Applied: 6 files

Next steps:
  1. Run yarn install
  2. Test your application
  3. Commit changes
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
| [create-eth](https://github.com/scaffold-eth/create-eth) | SE-2 CLI, extension list |
| [create-eth-extensions](https://github.com/scaffold-eth/create-eth-extensions) | Extension source (each extension = git branch) |

## Requirements

- SE-2 project root directory
- Git installed
- Yarn (not npm)
