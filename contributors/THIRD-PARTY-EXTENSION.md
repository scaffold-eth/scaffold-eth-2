## Introduction

Welcome to the guide for developing third-party extensions in the Scaffold-ETH 2 repository. Third-party extensions allow developers to extend the base instance created by `npx create-eth@latest`.

> Video Guide: For a visual walkthrough of the extension development process, check out our [YouTube tutorial](https://youtu.be/XQCv533XGZk?si=dlJH4zd4b99_6soW).

Once extension is published to GitHub, these extension can be used by other developers via:

```bash
npx create-eth@latest -e {your-github-userName}/{extension-repo-name}:{extension-branch-name} # extension-branch-name is optional
```

It's important to understand the distinction between an instance and an extension:

- An instance is created by `npx create-eth@latest` and contains full project files.
- An extension only contains extra files, directories, and [`*.args.mjs`](TEMPLATING.md#args-files) files that will be added to the base instance.

## Extension Structure

Before diving into the development process, let's understand the structure an extension should follow:

```
your-extension/
├── extension/
│   ├── packages/
│   │   ├── hardhat/        # (optional) For Hardhat-specific additions
│   │   │   ├── ...         # any extra files/directories
│   │   │   ├── package.json  # Only include additional dependencies/scripts
│   │   │   └── root.package.json  # Only include additional scripts to the root package.json
│   │   │
│   │   ├── foundry/        # (optional) For Foundry-specific additions
│   │   │   ├── ...         # any extra files/directories
│   │   │   ├── package.json  # Only include additional dependencies/scripts
│   │   │   └── root.package.json  # Only include additional scripts to the root package.json
│   │   │
│   │   └── nextjs/
│   │       ├── app/        # any new pages/files
│   │       │   └── my-page
│   │       │       ├── page.tsx
│   │       │
│   │       ├── ...         # any extra files/directories
│   │       └──  package.json  # Only include additional dependencies/scripts
│   ├── package.json        # monorepo root package.json file
│   └── README.md           # Instance README
└── README.md               # Documentation for your extension
```

### Key Points:

1. The `package.json` in your extension should only include dependencies that are additional to the base instance. Refer to the base `package.json` files for [root](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/templates/base/package.json), [nextjs](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/templates/base/packages/nextjs/package.json), [hardhat](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/templates/solidity-frameworks/hardhat/package.json) and [foundry](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/templates/solidity-frameworks/foundry/package.json) to determine which dependencies and scripts are already included. Only add dependencies that are not present in these base files. You can also add scripts to your root `package.json` based on the solidity framework by using a `root.package.json` file.

2. The presence of `hardhat` and/or `foundry` directories in your extension affects the CLI options:
   - If you include only one, users won't see a solidity framework selection prompt.

   - If you include both, users can choose between Hardhat and Foundry.

   - If you include neither, users will see all options (Hardhat, Foundry, or None) for solidity framework.

3. If your extension requires the addition of extra packages to the yarn monorepo (like a `subgraph`), place them in the appropriate directory under `extension/packages/`. Example [`extension/packages/subgraph`](https://github.com/scaffold-eth/create-eth-extensions/tree/subgraph/extension/packages)

## Developing a Simple Extension

For simple extensions, such as adding a new page or component, you can directly create the extension structure without going through the full development workflow mentioned below in the doc. Here's how:

1. Create the directory structure as shown above.
2. Add your new page or component in the appropriate directory.
3. If needed, create a `package.json` with any additional dependencies.
4. Push your extension to a GitHub repository.

That's it! Your simple extension is ready to be used by others via

```shell
npx create-eth@latest -e {your-github-userName}/{extension-repo-name}
```

## Template Files and Args

For more complex extensions that need to modify existing files, `create-eth` uses a templating system. This allows you to inject content into certain base files using `*.args.mjs` files.

Key points about template files:

- They allow you to add specific content to files in the base project.
- Not all files can be modified this way. See [TEMPLATE-FILES.md](./TEMPLATE-FILES.md) for a list of supported template files.
- To use a template file, create an `*.args.mjs` file in your extension having same patch structure as `*.template.mjs`. For example, to add an extra tab in the header, you'd create `extension/packages/nextjs/components/Header.tsx.args.mjs`.

## Advanced Development Workflow

For more complex extensions or if you prefer a guided approach, create-eth provides useful utilities to assist in developing, testing, and publishing your extensions.

These utilities can be used independently or together, depending on your needs:

1. Extension Development: Helps you create your extension based on changes you make to a base scaffold-eth-2 instance.

2. Local Testing: Allows you to test your extension locally and tweak things in full scaffold-eth 2 environment.

### Extension Development Utility

1. **Clone the Scaffold-ETH 2 Repository:**

   ```bash
   git clone https://github.com/scaffold-eth/scaffold-eth-2.git
   cd scaffold-eth-2
   yarn install
   ```

2. **Run the Build Script:**

   ```bash
   yarn build:dev
   ```

   This creates `cli.js` and `create-extension.js` in the `dist` directory.

3. **Run the CLI to Create a New Instance:**

   ```bash
   yarn cli
   ```

   This command will create a **new base instance**, similar to running `npx create-eth@latest`.
   Note: It's recommended to create a **new base instance** outside of the `scaffold-eth-2` folder, so use `../<your-instance-name>`.

   The name mentioned for the "Your project name" question will be used as the **extension name**. For example, if you provide `../eip` as the value to the question, then the final extension name will be `eip`.

4. **Develop the Extension:**
   - CD into the instance directory.
   - Make necessary changes to the instance project.
   - Commit the changes in the instance repository.

5. **Create the Extension:**

   Return to the `scaffold-eth-2` folder.

   ```bash
   yarn create-extension {projectName}
   ```

   Example: `yarn create-extension ../eip`

   This command gathers all changes from the instance and creates an extension in the `scaffold-eth-2/externalExtensions/${extensionName}` directory. This directory is the actual extension directory (notice it contains only the extra files related to your extension changes), which can be published to GitHub and used by others.

6. **Publish the Extension:**
   - Go inside the extension directory.
   - Push the extension to GitHub.

   ```bash
   cd scaffold-eth-2/externalExtensions/${extensionName}
   git init
   git add .
   git commit -m "Initial commit of my extension"
   git remote add origin <remote-repo-url>
   git push -u origin main
   ```

   Now other developers can use your published extension by using:

   ```bash
   npx create-eth@latest -e {your-github-userName}/{extension-repo-name}:{extension-branch-name} # extension-branch-name is optional
   ```

### Local Testing:

This phase allows you to test your extension locally and see how it works when used by other developers before publishing it to GitHub.

> NOTE: If you've already published your extension to GitHub using the "Developing a Simple Extension" approach, make sure to clone that extension repository into the `scaffold-eth-2/externalExtensions/` directory before proceeding with local testing.

1. **Run the CLI in dev mode:**

   ```bash
   yarn cli -e {extensionName} --dev
   ```

   Example: `yarn cli -e eip --dev`

   The `extensionName` should be present in `scaffold-eth-2/externalExtensions/${extensionName}`.

   Let's suppose you named your project "../my-dev-instance". Then this `../my-dev-instance` should contain all your extension changes. `--dev` will symlink the extension to the instance project.

2. **Test and Tweak the Extension:**
   Since the instance is symlinked with the extension, make necessary changes directly in the symlinked files within `../my-dev-instance`, and the changes should be automatically reflected in the `scaffold-eth-2/externalExtensions/${extensionName}` directory.

3. **Push the tweaked changes**
   - Go inside the extension directory.
   - Push the changes to GitHub.

   ```bash
   cd scaffold-eth-2/externalExtensions/${extensionName}
   git add .
   git commit -m "some changes"
   git push
   ```

   Next time users call your extension via `npx create-eth@latest -e`, they will get the updated version.

## Contributing to the Curated Extensions List

If your organization has created an extension and you'd like to add it to create-eth's curated extensions list (allowing users to install it via short flag names), you can submit a PR.

**Note**: This list is curated for established organizations and projects. Individual developers can still publish and share their extensions via the standard GitHub URL format (`npx create-eth@latest -e owner/repo:branch`).

### Extension Registry Structure

Extensions are organized in `src/extensions/` by category:

- **`create-eth-extensions.ts`** - Core extensions from scaffold-eth organization
- **`challenges.ts`** - SpeedRunEthereum challenge extensions
- **`organizations.ts`** - Third-party organization extensions (your extension goes here!)

### Adding Your Extension

1. **Edit `src/extensions/organizations.ts`** to add your extension:

```typescript
import { Extension } from "./types";

export const organizations: Extension[] = [
  // ... other extensions
  {
    extensionFlagValue: "metamask/gator-extension", // Must follow: githubOrg/repoName
    name: "Delegation Toolkit Extension", // Optional: Human-readable name
    description: "Clear description of what your extension does",
    repository: "https://github.com/metamask/gator-extension",
    branch: "main", // Optional: specific branch
    installCommand: "npx create-eth@latest -e metamask/gator-extension", // Optional
  },
];
```

2. **Required fields** (TypeScript will enforce these):
   - `extensionFlagValue` - **Must follow the format `githubOrg/repoName`** to avoid conflicts (e.g., "metamask/gator-extension", "envio/hyperindex")
   - `description` - What the extension provides
   - `repository` - Full GitHub repository URL

3. **Optional fields**:
   - `branch` - Specific branch (defaults to repo default branch)
   - `name` - Display name for UI (defaults to extensionFlagValue)
   - `createEthVersion` - create-eth version specification (defaults to latest)

4. **Test your addition**:

```bash
yarn type-check  # Ensures all required fields are present
yarn build       # Builds the project
```

5. **Submit your PR** with:
   - Updated TypeScript file (`src/extensions/organizations.ts`)
   - Brief description of your organization and the extension's purpose

Your PR will be reviewed by the maintainers. We prioritize extensions from established organizations that provide value to the broader Ethereum development community.
