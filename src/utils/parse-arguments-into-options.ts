import type { Args, ExternalExtension, SolidityFramework, RawOptions, SolidityFrameworkChoices } from "../types";
import arg from "arg";
import * as https from "https";
import {
  getDataFromExternalExtensionArgument,
  getSolidityFrameworkDirsFromExternalExtension,
} from "./external-extensions";
import chalk from "chalk";
import { CURATED_EXTENSIONS } from "../curated-extensions";
import { SOLIDITY_FRAMEWORKS } from "./consts";
import { validateFoundryUp } from "./system-validation";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validateNpmName } from "./validate-name";

const validateExternalExtension = async (
  extensionName: string,
  dev: boolean,
): Promise<{ repository: string; branch?: string } | string> => {
  if (dev) {
    // Check externalExtensions/${extensionName} exists
    try {
      const currentFileUrl = import.meta.url;
      const externalExtensionsDirectory = path.resolve(
        decodeURI(fileURLToPath(currentFileUrl)),
        "../../externalExtensions",
      );
      await fs.promises.access(`${externalExtensionsDirectory}/${extensionName}`);
    } catch {
      throw new Error(`Extension not found in "externalExtensions/${extensionName}"`);
    }

    return extensionName;
  }

  const { githubUrl, githubBranchUrl, branch } = getDataFromExternalExtensionArgument(extensionName);

  // Check if repository exists
  await new Promise((resolve, reject) => {
    https
      .get(githubBranchUrl, res => {
        if (res.statusCode !== 200) {
          reject(new Error(`Extension not found: ${githubUrl}`));
        } else {
          resolve(null);
        }
      })
      .on("error", err => {
        reject(err);
      });
  });

  return { repository: githubUrl, branch };
};

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
  const extensionName = args["--extension"] && rawArgs.slice(2).find(a => a.toLowerCase() === args["--extension"]);
  // ToDo. Allow multiple
  const extension = extensionName ? await validateExternalExtension(extensionName, dev) : null;

  if (!dev && extension && !CURATED_EXTENSIONS[args["--extension"] as string]) {
    console.log(
      chalk.yellow(
        ` You are using a third-party extension. Make sure you trust the source of ${chalk.yellow.bold(
          (extension as ExternalExtension).repository,
        )}\n`,
      ),
    );
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

  // if lengh is 1, we don't give user a choice and set it ourselves.
  const solidityFramework =
    solidityFrameworkChoices.length === 1 ? solidityFrameworkChoices[0] : (args["--solidity-framework"] ?? null);

  if (solidityFramework === SOLIDITY_FRAMEWORKS.FOUNDRY) {
    await validateFoundryUp();
  }

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
