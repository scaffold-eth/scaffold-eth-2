import type { Args, ExternalExtension, SolidityFramework, RawOptions } from "../types";
import arg from "arg";
import * as https from "https";
import { getDataFromExternalExtensionArgument } from "./external-extensions";
import chalk from "chalk";
import { CURATED_EXTENSIONS } from "../config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
      throw new Error(`Extesnion not found in "externalExtensions/${extensionName}"`);
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
export async function parseArgumentsIntoOptions(rawArgs: Args): Promise<RawOptions> {
  const args = arg(
    {
      "--install": Boolean,
      "-i": "--install",

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
      argv: rawArgs.slice(2).map(a => a.toLowerCase()),
    },
  );

  const install = args["--install"] ?? null;
  const skipInstall = args["--skip-install"] ?? null;

  if (install && skipInstall) {
    throw new Error('Please select only one of the options: "--install" or "--skip-install".');
  }

  const hasInstallRelatedFlag = install || skipInstall;

  const dev = args["--dev"] ?? false; // info: use false avoid asking user

  const help = args["--help"] ?? false;

  const project = args._[0] ?? null;

  const solidityFramework = args["--solidity-framework"] ?? null;

  // ToDo. Allow multiple
  const extension = args["--extension"] ? await validateExternalExtension(args["--extension"], dev) : null;

  if (!dev && extension && !CURATED_EXTENSIONS[args["--extension"] as string]) {
    console.log(
      chalk.yellow(
        ` You are using a third-party extension. Make sure you trust the source of ${chalk.yellow.bold(
          (extension as ExternalExtension).repository,
        )}\n`,
      ),
    );
  }

  return {
    project,
    install: hasInstallRelatedFlag ? install || !skipInstall : null,
    dev,
    externalExtension: extension,
    help,
    solidityFramework,
  };
}

const SOLIDITY_FRAMEWORK_OPTIONS = ["hardhat", "foundry", "none"];

function solidityFrameworkHandler(value: string) {
  const lowercasedValue = value.toLowerCase();
  if (SOLIDITY_FRAMEWORK_OPTIONS.includes(lowercasedValue)) {
    return lowercasedValue as SolidityFramework | "none";
  }

  // choose from cli prompts
  return null;
}
