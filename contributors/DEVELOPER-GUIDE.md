# Developer Guide

This project is aimed to be consumed via `npx create`. The code in this repo is the source used to generate the consumable script.

The steps you should follow to make changes to the code are the following:
1. Clone and `cd` into the repo
2. Start a development server watching changes with `yarn dev`. This process will build the script as you save changes.

Now there are two scenarios depending on if you want to change the CLI tool itself, or the project resulting from running the CLI.

To avoid confusion when talking about this project or resulting projects, we'll refer to projects created via the CLI tool as "instance projects".

## Changes to the CLI

The CLI tool source code can be found under `src/`. As you make changes in those files, the development server will compile the source and generate the script inside `bin/`.

To run the script you can simply run
```bash
yarn cli
```

This command will do two things:
1. Remove the folder `test-cli/` if it exists.
2. Run the CLI script using the folder `test-cli/` as the destination.

If you wanted to use a different name or destination, you could also run the CLI via node.
```bash
node path-to-this-repo/bin/create-dapp-se2.js [project-name --flags]
```

You can send any option or flag to the CLI command, except for the project name, which is hardcoded to be "test-cli" in the package.json script. For example, a handy command is `yarn cli -s` to tell the CLI to skip installing dependencies.

## Changes to the Resulting Project

The source files for the instance projects can be found under `templates/`. You'll see there are two folders there: `base/` and `extensions/`. The `base/` folder has the source files that will be present in all instances, whereas `extensions/` hold the source files that will be added or not to the instances based on the user choices within the CLI tool.

It's highly recommended that you go through [RFC-extensions.md](contributors/RFC-extensions.md) to understand the template API to create extensions. We use a custom template API to allow extensions to modify any file inside the `templates/` folder. While flexible and powerful, it requires developers to understand how it works. It's JS based, so there's no new technology needed to understand and use it.

While you might be tempted to change files straight in the source, we've created a better way to do it with the dev mode. We feel this is worth a separate section in this document.

## Dev Mode
The dev mode creates a special instance linked to the `templates/` folder. You can enable it by adding the `--dev` flag when using the CLI.

```bash
yarn cli --dev # or the alternative version using node proposed earlier
```

This is great because you can run your instance project as any other project, make changes there and see your instance project update in real time. Without this utility you'd need to change the source file, call the CLI, and run the instance project every time you changed something.

Because the files are linked, changes in your instance project will also modify the source files in this projects `template/` folder.

There's a caveat: special files.

### Special Files

There are some files that are not just copied, but generated from the CLI using multiple source files. With those files you can still make changes to the instance project and see how they affect it, but they won't automatically show up in this project's `template/` folder.

Once you're happy with the file contents, you'd need to reverse-engineer the changes needed in this project's `template/` folder. To make it easier to figure out what to change, we generate sibling files to any of these special ones, with the exact same name but adding `*.dev` to them.

For example, `generated.txt` would have a sibling `generated.txt.dev` file with information about the "template" and "args" files that contributed to the current result.