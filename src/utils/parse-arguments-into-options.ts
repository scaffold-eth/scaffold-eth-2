import type { Args, RawOptions } from "../types";
import arg from "arg";
import * as https from "https";
import { getDataFromExternalExtensionArgument } from "./external-extensions";
import chalk from "chalk";
import { CURATED_EXTENSIONS } from "../config";

const validateTemplate = async (
  template: string
): Promise<{ repository: string; branch?: string }> => {
  const { githubUrl, githubBranchUrl, branch } = getDataFromExternalExtensionArgument(template);

  // Check if repository exists
  await new Promise((resolve, reject) => {
    https
      .get(githubBranchUrl, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Template not found: ${githubUrl}`));
        } else {
          resolve(null);
        }
      })
      .on("error", (err) => {
        reject(err);
      });
  });

  return { repository: githubUrl, branch };
};

// TODO update smartContractFramework code with general extensions
export async function parseArgumentsIntoOptions(
  rawArgs: Args
): Promise<RawOptions> {
  const args = arg(
    {
      "--install": Boolean,
      "-i": "--install",

      "--skip-install": Boolean,
      "--skip": "--skip-install",
      "-s": "--skip-install",

      "--dev": Boolean,

      "--extension": String,
      "-e": "--extension",
    },
    {
      argv: rawArgs.slice(2).map((a) => a.toLowerCase()),
    }
  );

  const install = args["--install"] ?? null;
  const skipInstall = args["--skip-install"] ?? null;
  const hasInstallRelatedFlag = install || skipInstall;

  const dev = args["--dev"] ?? false; // info: use false avoid asking user

  const project = args._[0] ?? null;

  // ToDo. Allow multiple
  // ToDo. Allow core extensions too
  const extension = args["--extension"]
    ? await validateTemplate(args["--extension"])
    : null;

  if (extension && !CURATED_EXTENSIONS[args["--extension"] as string]) {
    console.log(chalk.yellow(` You are using a third-party extension. Make sure you trust the source of ${chalk.yellow.bold(extension.repository)}\n`));
  }

  return {
    project,
    install: hasInstallRelatedFlag ? install || !skipInstall : null,
    dev,
    extensions: null, // TODO add extensions flags
    externalExtension: extension,
  };
}
