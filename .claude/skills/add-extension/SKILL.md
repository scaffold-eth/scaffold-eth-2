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

Extensions use `.args.mjs` files to modify existing project files. Each file exports named constants that correspond to specific insertion points in the target file's `.template.mjs` in the create-eth repo.

**Instead of relying on hardcoded pattern docs, use sub-agents to dynamically fetch template sources and docs from create-eth. This keeps the main context clean and always uses up-to-date information.**

### Step 2a: Fetch Template Context (use `fetch-template-context` sub-agent)

**Collect all `targetFile` values from `args_merge` tasks** and delegate to the `fetch-template-context` sub-agent. It fetches the create-eth template registry, finds each matching `.template.mjs`, and returns the template source with an explanation of how each arg is consumed.

Invoke it via the Task tool:
```
subagent_type: "fetch-template-context"
prompt: "Fetch template context for these target files: packages/nextjs/components/Header.tsx, packages/nextjs/app/page.tsx, packages/nextjs/scaffold.config.ts"
```

The sub-agent returns for each file:
1. **The `.template.mjs` source** -- shows the template function and how each arg is interpolated
2. **An example `.args.mjs`** -- a real-world example of how extensions provide values
3. **How each arg is used** -- where it's inserted and what type it expects

Use this information to apply the args from the extension's `.args.mjs` to the existing project file.

### Step 2b: Fetch General Docs (use `fetch-extension-docs` sub-agent, run once if needed)

If the template source is unclear, or if you encounter `withDefaults`, `$$` expressions, or unfamiliar patterns, delegate to the `fetch-extension-docs` sub-agent for deeper context:

```
subagent_type: "fetch-extension-docs"
prompt: "Fetch the create-eth templating and extension docs"
```

It fetches and distills `TEMPLATING.md` and `THIRD-PARTY-EXTENSION.md` from create-eth, returning key information about:
- How template files and args files relate to each other
- The `withDefaults` utility and argument passing
- Rules for template args (string args, object overrides, `$$` convention)
- How `package.json` merging works
- Extension folder anatomy

### When No Template Is Found

If the sub-agent reports no template for a target file, use your best judgment:
- If the export name suggests it's a string to prepend/append, do that
- If the name suggests it's a configuration value, merge it into the appropriate config object
- `fullContentOverride` always means: replace the entire file content
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
