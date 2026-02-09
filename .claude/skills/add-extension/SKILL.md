---
name: add-extension
description: Merge a scaffold-eth extension into the current project
disable-model-invocation: false
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
user-invocable: true
---

Merge the `$0` extension into this Scaffold-ETH-2 project using a hybrid approach:
a Node.js script handles deterministic operations, then you handle intelligent file merging.

## Step 1: Run the Script

```bash
node .claude/skills/add-extension/skill.mjs $0 $@
```

The script will:
1. Validate the extension exists in the registry
2. Detect the SE-2 project and solidity framework
3. Fetch extension files from GitHub
4. Copy new files directly into the project
5. Merge package.json dependencies and scripts
6. Register new workspaces
7. Output **AI merge tasks** as JSON between markers

## Step 2: Process AI Merge Tasks

After the script runs, look for output between these markers:

```
--- AI_MERGE_TASKS_BEGIN ---
[JSON array of tasks]
--- AI_MERGE_TASKS_END ---
```

And optionally:

```
--- TEMPLATE_TASKS_BEGIN ---
[JSON array of template tasks]
--- TEMPLATE_TASKS_END ---
```

Each task has a `type` field. Process them in order:

### Task type: `args_merge`

Fields:
- `targetFile`: relative path to the file to modify (e.g. `packages/nextjs/components/Header.tsx`)
- `exports`: array of `{ name, type }` describing each exported constant
- `argsContent`: the raw source code of the `.args.mjs` file

**Read the target file**, then apply each export according to the rules in "How .args.mjs Exports Work" below.

### Task type: `file_conflict`

Fields:
- `targetFile`: relative path to the conflicting file in the project
- `extensionContent`: the full text content of the extension's version of the file (inlined in JSON)

The extension has a file that already exists in the project. Read the existing project file at `targetFile`, then compare it with `extensionContent` and merge them:
- **Imports**: Union both sets of imports (no duplicates)
- **New functions/components**: Add any new functions from the extension
- **Modified functions**: If both versions modify the same function, prefer the extension's changes but preserve any project-specific customizations
- **Configuration objects**: Deep merge, with extension values taking precedence for new keys
- **When in doubt**: Keep both versions and add a comment noting the merge

### Task type: `standalone_template`

Fields:
- `targetFile`: relative path for the output file
- `templateContent`: raw `.template.mjs` source code

Extract the template literal content from the `contents` function. The template typically looks like:

```javascript
const contents = () => `
  ...file content here...
`;
export default contents;
```

Extract the string inside the template literal and write it to `targetFile`. If the target file exists, merge intelligently.

## How .args.mjs Exports Work

Extensions use `.args.mjs` files to modify existing project files. Each file exports named constants that correspond to specific insertion points in the target file. Here are all the patterns used by real extensions:

### `preContent` (string)

**What it does**: Adds import statements or code at the top of the file.

**How to apply**: Add the string content as import lines near the top of the target file, after existing imports.

Example `.args.mjs`:
```javascript
export const preContent = `import { TokenBalance } from "../components/TokenBalance";`;
```

Apply to `Header.tsx`: Add the import line after the existing imports block.

### `postContent` (string)

**What it does**: Appends content to the end of the file.

**How to apply**: Add the string content at the end of the target file, before any final export statement.

### `extraMenuLinksObjects` (array)

**What it does**: Adds menu items to `Header.tsx`'s navigation.

**How to apply**: Find the `menuLinks` array in `packages/nextjs/components/Header.tsx` and add the new objects to it.

Example `.args.mjs`:
```javascript
export const extraMenuLinksObjects = [
  { label: "Token", href: "/token", icon: "BanknotesIcon" }
];
```

Apply: Add the object(s) to the `menuLinks` array, typically after the existing entries and before the closing `]`.

### `menuObjects` (string)

**What it does**: Alternative pattern — adds menu items as a raw string (not an array).

**How to apply**: Same as `extraMenuLinksObjects` but the value is a string representation. Parse or insert it into the `menuLinks` array.

### `configOverrides` (object)

**What it does**: Merges configuration into `packages/nextjs/scaffold.config.ts`.

**How to apply**: Read the scaffold config, find the `scaffoldConfig` object, and merge each key from `configOverrides` into it.

Example `.args.mjs`:
```javascript
export const configOverrides = {
  targetNetworks: ["$$chains.baseSepolia$$"],
  pollingInterval: 5000
};
```

**Important**: `$$expr$$` markers mean raw code — see "The $$ Convention" below.

### `skipLocalChainInTargetNetworks` (boolean)

**What it does**: When `true`, the `targetNetworks` in `configOverrides` should **replace** (not append to) the existing `targetNetworks` array.

**How to apply**: If `true` and `configOverrides.targetNetworks` exists, replace the entire `targetNetworks` array. If `false` or absent, append the new networks after existing ones.

### `fullContentOverride` (string)

**What it does**: Completely replaces the target file's content.

**How to apply**: Write the string as the entire file content, replacing whatever was there before. This is commonly used for `README.md`.

### `extraContents` (string)

**What it does**: Appends content to the end of a file (commonly `README.md`).

**How to apply**: Append the string to the end of the existing file content with a newline separator.

### `additionalVars` (string)

**What it does**: Adds environment variables to `.env.example`.

**How to apply**: Append the string to the end of the `.env.example` file. Each line is typically a `KEY=value` pair or a comment.

### `deploymentsLogic` (string)

**What it does**: Adds deployment logic to `packages/foundry/script/Deploy.s.sol`.

**How to apply**: Find the `run()` function in `Deploy.s.sol` and add the deployment code inside it, typically after existing deployments. The content includes Solidity statements.

### `description` (string)

**What it does**: Replaces or sets the description text in a page component.

**How to apply**: Find the description/subtitle text in the target page file and replace it with this string.

### `externalExtensionName` (string)

**What it does**: Sets the extension display name in page titles or headings.

**How to apply**: Find the extension name placeholder in the target page and replace it.

### `logoTitle` (string)

**What it does**: Changes the app title in `Header.tsx`.

**How to apply**: Find the logo title text (default: `"Scaffold-ETH"`) in Header.tsx and replace it.

### `logoSubtitle` (string)

**What it does**: Changes the app subtitle in `Header.tsx`.

**How to apply**: Find the logo subtitle text (default: `"Ethereum dev stack"`) in Header.tsx and replace it.

### `imports` (string)

**What it does**: Adds import statements. Similar to `preContent` but specifically for imports.

**How to apply**: Add the import lines after existing imports in the target file.

### Unknown exports

If you encounter an export name not listed above, use your best judgment:
- If the name suggests it's a string to prepend/append, do that
- If the name suggests it's a configuration value, merge it into the appropriate config object
- If unsure, show the user the export and ask how to apply it

## The `$$` Convention

In `.args.mjs` files, `$$expr$$` marks a raw JavaScript expression that should NOT be quoted in the output.

Example in `.args.mjs`:
```javascript
export const configOverrides = {
  targetNetworks: ["$$chains.baseSepolia$$"]
};
```

When you apply this to `scaffold.config.ts`, write:
```typescript
targetNetworks: [chains.baseSepolia],
```

**NOT**:
```typescript
targetNetworks: ["chains.baseSepolia"],  // WRONG - don't quote it
```

The `$$` markers are delimiters only — strip them and use the expression as bare code. If the target file needs the corresponding import (e.g., `import { chains } from ...`), check if it already exists and add it if missing.

## Handling Standalone .template.mjs Files

Standalone templates (without a corresponding `.args.mjs`) contain a function that returns a template literal with the file content. Example:

```javascript
import { withDefaults } from "../../utils.js";

const contents = ({ solidityFramework }) => `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract MyContract { }
`;

export default withDefaults(contents, { solidityFramework: "" });
```

To process:
1. Extract the template literal content (the string between the backticks in the `contents` function)
2. Replace any `${...}` template expressions with reasonable defaults
3. Write the result to the target file

## Handling Missing Target Files

If an `args_merge` task targets a file that does not exist in the project:
- For `fullContentOverride`: create the file with the provided content
- For other exports: create the file with a reasonable default structure, then apply the exports
- If unsure, inform the user and ask how to proceed

## Handling Conflicts

When merging a `file_conflict` or `args_merge` where the target already exists:

1. **Read the existing project file** to understand current state
2. **Merge intelligently** — preserve existing functionality, add new code from the extension
3. **Don't duplicate** — if the extension adds an import that already exists, skip it
4. **Maintain style** — match the existing code style (indentation, quotes, etc.)
5. **Imports**: union both sets, keeping both the project's and extension's imports
6. **Array items**: append new items, don't replace existing ones (unless `skipLocalChainInTargetNetworks` is true)
7. **Config objects**: deep merge, extension values win for new keys

## Step 3: Post-Merge

After processing all AI merge tasks:

1. Run `yarn install` if any dependencies were added
2. Run `yarn next:build` to verify the build succeeds
3. If the build fails, read the error and fix it
4. Summarize what was added:
   - New files copied
   - Files modified via .args.mjs
   - Dependencies added
   - Any manual steps needed

## Options

| Flag | Short | Description |
|------|-------|-------------|
| `--dry-run` | `-d` | Preview changes without applying |
| `--verbose` | `-v` | Show detailed error messages |
| `--local <path>` | `-l` | Use local extension path (for development) |
| `--solidity-framework <fw>` | `-s` | Choose hardhat/foundry |
| `--list` | `-L` | List all available extensions |
| `--help` | `-h` | Show help message |

## Framework Selection

- Project has hardhat -> uses hardhat files (no prompt)
- Project has foundry -> uses foundry files (no prompt)
- Project has neither -> prompts or uses `-s` flag
- Flag mismatch with project -> errors

## On Failure

- If extension not found: suggest `--list` to see available extensions
- If not SE-2 project: confirm user is in project root
- If build fails after merge: read errors, fix issues, try again

## Notes

- Temp files are in `.claude/skills/add-extension/.tmp`
- The script cleans up temp files after outputting JSON (argsContent is inlined)
- Don't ask permission for `.tmp` folder operations

## Examples

```bash
/add-extension erc-20
/add-extension subgraph --dry-run
/add-extension ponder -s hardhat
```
