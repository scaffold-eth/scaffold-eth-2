## Introduction

Welcome to the guide for developing third-party extensions in the `create-eth` repository. Third-party extensions allow developers to extend the base instance created by `npx create-eth@latest`.

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
│   │   ├── foundry/        # (optional) For Foundry-specific additions
│   │   └── nextjs/
│   │       ├── app/        # any new pages/files
│   │       │   └── my-page
│   │       │       ├── page.tsx
│   │       │
│   │       ├── ...         # any extra files/directories
│   │       └── package.json  # Only include additional dependencies/scripts
│   ├── package.json        # monorepo root package.json file
│   └── README.md           # Instance README
└── README.md               # Documentation for your extension
```

### Key Points:

1. The `package.json` in your extension should only include dependencies that are additional to the base instance. Refer to the base `package.json` files for [root](https://github.com/scaffold-eth/create-eth/blob/main/templates/base/package.json), [nextjs](https://github.com/scaffold-eth/create-eth/blob/main/templates/base/packages/nextjs/package.json) and [hardhat](https://github.com/scaffold-eth/create-eth/blob/main/templates/solidity-frameworks/hardhat/package.json) to determine which dependencies and scripts are already included. Only add dependencies that are not present in these base files

2. The presence of `hardhat` and/or `foundry` directories in your extension affects the CLI options:

   - If you include only one, users won't see a solidity framework selection prompt.

   - If you include both, users can choose between Hardhat and Foundry.

   - If you include neither, users will see all options (Hardhat, Foundry, or None) for solidity framework.

3. If you're extension require addition of extra package to yarn monorepo (like a `subgraph`), place them in the appropriate directory under `extension/packages/`. Example [`extension/package/subgraph`](https://github.com/scaffold-eth/create-eth-extensions/tree/subgraph/extension/packages)

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
- To use a template file, create an `*.args.mjs` file in your extension having same patch structure as `*.template.mjs`. For example, to add extra tab in the header, you'd create `extension/packages/nextjs/components/Header.tsx.args.mjs`.

## Advanced Development Workflow

For more complex extensions or if you prefer a guided approach, create-eth provides useful utilities to assist in developing, testing, and publishing your extensions.

These utilities can be used independently or together, depending on your needs:

1. Extension Development: Helps you create your extension based on changes you make to a base scaffold-eth-2 instance.

2. Local Testing: Allows you to test your extension locally and tweak things in full scaffold-eth 2 environment.

### Extension Development Utility

1. **Clone the `create-eth` Repository:**

   ```bash
   git clone https://github.com/scaffold-eth/create-eth.git
   cd create-eth
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

   The name mentioned for the "Your project name" question will be used as the **extension name**. For example, if you provide `eip` as the value to the question, then the final extension name will be `eip`.

4. **Develop the Extension:**

   - CD into the instance directory.
   - Make necessary changes to the instance project.
   - Commit the changes in the instance repository.

5. **Create the Extension:**

   Return to the `create-eth` folder.

   ```bash
   yarn create-extension {projectName}
   ```

   Example: `yarn create-extension eip`

   This command gathers all changes from the instance and creates an extension in the `create-eth/externalExtensions/${extensionName}` directory. This directory is the actual extension directory (notice it contains only extra files related to your extension changes), which can be published to GitHub and used by others.

6. **Publish the Extension:**

   - Go inside the extension directory.
   - Push the extension to GitHub.

   ```bash
   cd create-eth/externalExtensions/${extensionName}
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

> NOTE: If you've already published your extension to GitHub using the "Developing a Simple Extension" approach, make sure to clone that extension repository into the `create-eth/externalExtensions/` directory before proceeding with local testing.

1. **Run the CLI in dev mode:**

   ```bash
   yarn cli -e {extensionName} --dev
   ```

   Example: `yarn cli -e eip --dev`

   The `extensionName` should be present in `create-eth/externalExtensions/${extensionName}`.

   Let's suppose you named your project "my-dev-instance". Then this `my-dev-instance` should contain all your extension changes. `--dev` will symlink the extension to the instance project.

2. **Test and Tweak the Extension:**
   Since the instance is symlinked with the extension, make necessary changes directly in the symlinked files within `my-dev-instance`, and changes should be automatically reflected in the `create-eth/externalExtensions/${extensionName}` directory.

3. **Push the tweaked changes**

   - Go inside the extension directory.
   - Push the changes to GitHub.

   ```bash
   cd create-eth/externalExtensions/${extensionName}
   git add .
   git commit -m "some changes"
   git push
   ```

   Next time users call your extension via `npx create-eth@latest -e`, they will get the updated version.
