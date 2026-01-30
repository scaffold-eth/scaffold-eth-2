# /add-extension - SE-2 Extension Merger

Claude Code skill for adding Scaffold-ETH-2 extensions to existing projects post-creation.

## Repositories

**IMPORTANT - Core Repos:**
- **create-eth**: https://github.com/scaffold-eth/create-eth
  - Main SE-2 creation CLI
  - Extension list: `src/extensions/create-eth-extensions.ts`
- **create-eth-extensions**: https://github.com/scaffold-eth/create-eth-extensions
  - Extension source repo (each extension is a git branch)
  - Structure: `extension/` folder contains files with `.args.mjs` merge instructions alongside target files
  - Example: `extension/README.md.args.mjs`, `extension/packages/nextjs/components/Header.tsx.args.mjs`

## Problem

SE-2 projects can only add extensions at init via `create-eth`. No mechanism exists to add extensions post-creation.

## Usage

```bash
# Basic usage (in SE-2 project root)
/add-extension erc-20

# Preview changes
/add-extension subgraph --dry-run

# Choose framework (for dual-framework extensions)
/add-extension ponder --framework hardhat

# Local dev
/add-extension erc-721 --local ../create-eth-extensions

# Force reinstall
/add-extension erc-20 --force
```

### Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview changes without applying |
| `--force` | Reinstall even if installed |
| `--yes` | Skip confirmation prompts |
| `--verbose` | Detailed error messages |
| `--local <path>` | Use local extension path |
| `--framework <name>` | Choose hardhat or foundry |

## Available Extensions

Fetched dynamically from [create-eth repository](https://github.com/scaffold-eth/create-eth/blob/main/src/extensions/create-eth-extensions.ts):

`subgraph`, `x402`, `eip-712`, `ponder`, `erc-20`, `eip-5792`, `randao`, `erc-721`, `porto`, `envio`, `drizzle-neon`

Run `/add-extension --help` for latest list.

## How It Works

1. **Validation** - Detects SE-2 project (checks scaffold.config.ts)
2. **Fetch** - Clones extension branch from `scaffold-eth/create-eth-extensions`
3. **Framework Selection** - Prompts if extension has both hardhat/foundry
4. **Analysis** - Compares extension vs existing project files
5. **Merge** - Copies new files, prompts for modified files, merges package.json
6. **Track** - Adds extension to `package.json` `scaffoldEth.extensions`
7. **Install** - Runs `yarn install` for new dependencies

### File Handling

- **New files** → Copied directly
- **Modified files** → Manual merge (Claude assists)
- **package.json** → Auto-merged (scripts, dependencies)
- **.args.mjs** → Template-based merge via create-eth utils

## Extension Tracking

Installed extensions tracked in `package.json`:

```json
{
  "scaffoldEth": {
    "extensions": ["erc-20", "subgraph"]
  }
}
```

Prevents duplicate installs.

## Requirements

- SE-2 project root
- Git repo recommended
- Yarn (not npm)

## Architecture

```
.claude/skills/add-extension/
├── skill.mjs                 # Entry point
├── lib/
│   ├── validator.mjs         # SE-2 detection & validation
│   ├── fetcher.mjs           # GitHub/local fetching
│   ├── analyzer.mjs          # File diff analysis
│   ├── merger.mjs            # Change application
│   ├── extensionTracker.mjs  # Extension tracking & args
│   ├── templateMerger.mjs    # Template-based merging
│   └── create-eth-utils/     # Utils from create-eth
```

### Key Modules

**validator.mjs** - Detects SE-2 projects, validates extension names against live repo list (5min cache)

**fetcher.mjs** - Clones extension branches from GitHub or uses local path

**analyzer.mjs** - Compares files, detects frameworks, builds changeset

**merger.mjs** - Applies changes: copy new, prompt modified, merge package.json

**extensionTracker.mjs** - Tracks installed extensions, loads/merges .args.mjs

**templateMerger.mjs** - Renders templates with merged args from all extensions

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
  ...

Modified files (1):
  ~ packages/nextjs/components/Header.tsx

package.json changes:
  Dependencies: + @openzeppelin/contracts@^5.0.0
  Scripts: + deploy:erc20

📝 Applying changes...
✓ Tracked extension in package.json
✓ Dependencies installed

==================================================
Extension "erc-20" merge complete!
==================================================

✓ Applied: 6 files
⚠ Skipped: 1 file (manual merge needed)

Next steps:
  1. Review and merge skipped files
  2. Test application
  3. Commit changes
```

## Development

```bash
# Test locally
node /path/to/skill.mjs erc-20 --dry-run

# Via Claude Code
/add-extension erc-20 --local ../create-eth-extensions
```
