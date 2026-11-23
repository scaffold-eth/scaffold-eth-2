import type { Args, SolidityFramework, RawOptions, SolidityFrameworkChoices } from "../types";
import arg from "arg";
import { getSolidityFrameworkDirsFromExternalExtension, validateExternalExtension } from "./external-extensions";
import chalk from "chalk";
import { SOLIDITY_FRAMEWORKS } from "./consts";
import { validateNpmName } from "./validate-name";
import { confirm } from "@inquirer/prompts";
import packageJson from "../../package.json";
import { execa } from "execa";

// TODO update smartContractFramework code with general extensions
export async function parseArgumentsIntoOptions(
  rawArgs: Args,
): Promise<{ rawOptions: RawOptions; solidityFrameworkChoices: SolidityFrameworkChoices }> {
  const args = arg(
    {
      "--skip-install": Boolean,
      "--skip": "--skip-install",

      "--dev": Boolean,

      "--solidity-framework": solidityFrameworkHandler,
      "-s": "--solidity-framework",

      "--extension": String,
      "-e": "--extension",

      "--help": Boolean,
      "-h": "--help",
    },
    {
      argv: rawArgs.slice(2),
    },
  );

  const skipInstall = args["--skip-install"] ?? null;

  const dev = args["--dev"] ?? false; // info: use false avoid asking user

  const help = args["--help"] ?? false;

  let project: string | null = args._[0] ?? null;

  // use the original extension arg
  const extensionName = args["--extension"];
  // ToDo. Allow multiple
  const extension = extensionName ? await validateExternalExtension(extensionName, dev) : null;

  // if dev mode, extension would be a string
  if (extension && typeof extension === "object" && !extension.isTrusted) {
    console.log(
      chalk.yellow(
        ` You are using a third-party extension. Make sure you trust the source of ${chalk.yellow.bold(
          extension.repository,
        )}\n`,
      ),
    );
  }

  // Check if extension createEthVersion matches current version
  if (extension && typeof extension === "object" && extension.recommendedCreateEthVersion) {
    const currentVersion = packageJson.version;

    if (extension.recommendedCreateEthVersion !== currentVersion) {
      console.log(
        chalk.yellow(
          `\n⚠️  This extension requires create-eth ${chalk.bold(`v${extension.recommendedCreateEthVersion}`)}, but you're running ${chalk.bold(`v${currentVersion}`)}.\n`,
        ),
      );

      const switchVersion = await confirm({
        message: `Would you like to run with the correct version (${extension.recommendedCreateEthVersion})?`,
        default: true,
      });

      if (switchVersion) {
        console.log(chalk.gray(`\nSwitching to create-eth@${extension.recommendedCreateEthVersion}...\n`));

        await execa("npx", [`create-eth@${extension.recommendedCreateEthVersion}`, ...rawArgs.slice(2)], {
          stdio: "inherit",
        });

        process.exit(0);
      }

      const proceed = await confirm({
        message: "Do you want to proceed with the current version anyway?",
        default: false,
      });

      if (!proceed) {
        console.log(chalk.gray("\nSetup cancelled. No project was created"));
        process.exit(0);
      }
    }
  }

  if (project) {
    const validation = validateNpmName(project);
    if (!validation.valid) {
      console.error(
        `Could not create a project called ${chalk.yellow(`"${project}"`)} because of naming restrictions:`,
      );

      validation.problems.forEach(p => console.error(`${chalk.red(">>")} Project ${p}`));
      project = null;
    }
  }

  let solidityFrameworkChoices = [
    SOLIDITY_FRAMEWORKS.HARDHAT,
    SOLIDITY_FRAMEWORKS.FOUNDRY,
    { value: null, name: "none" },
  ];

  if (extension) {
    const externalExtensionSolidityFrameworkDirs = await getSolidityFrameworkDirsFromExternalExtension(extension);

    if (externalExtensionSolidityFrameworkDirs.length !== 0) {
      solidityFrameworkChoices = externalExtensionSolidityFrameworkDirs;
    }
  }

  // if length is 1, we don't give user a choice and set it ourselves.
  const solidityFramework =
    solidityFrameworkChoices.length === 1 ? solidityFrameworkChoices[0] : (args["--solidity-framework"] ?? null);

  return {
    rawOptions: {
      project,
      install: !skipInstall,
      dev,
      externalExtension: extension,
      help,
      solidityFramework: solidityFramework as RawOptions["solidityFramework"],
    },
    solidityFrameworkChoices,
  };
}

const SOLIDITY_FRAMEWORK_OPTIONS = [...Object.values(SOLIDITY_FRAMEWORKS), "none"];
function solidityFrameworkHandler(value: string) {
  const lowercasedValue = value.toLowerCase();
  if (SOLIDITY_FRAMEWORK_OPTIONS.includes(lowercasedValue)) {
    return lowercasedValue as SolidityFramework | "none";
  }

  // choose from cli prompts
  return null;
}
