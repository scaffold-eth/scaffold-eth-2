import type { Args, RawOptions } from "../types";
import arg from "arg";

// TODO update smartContractFramework code with general extensions
export function parseArgumentsIntoOptions(rawArgs: Args): RawOptions {
  const args = arg(
    {
      "--install": Boolean,
      "-i": "--install",

      "--skip-install": Boolean,
      "--skip": "--skip-install",
      "-s": "--skip-install",

      "--solidity-framework": solidityFrameworkHandler,
      "-f": "--solidity-framework",

      "--dev": Boolean,
    },
    {
      argv: rawArgs.slice(2).map((a) => a.toLowerCase()),
    }
  );

  const install = args["--install"] ?? null;
  const skipInstall = args["--skip-install"] ?? null;

  if (install && skipInstall) {
    throw new Error(
      'Please select only one of the options: "--install" or "--skip-install".'
    );
  }

  const hasInstallRelatedFlag = install || skipInstall;

  const dev = args["--dev"] ?? false; // info: use false avoid asking user

  const project = args._[0] ?? null;

  const solidityFramework = args["--solidity-framework"] ?? null;

  return {
    project,
    install: hasInstallRelatedFlag ? install || !skipInstall : null,
    dev,
    solidityFramework,
  };
}

function solidityFrameworkHandler(value: string) {
  const lowercasedValue = value.toLowerCase();
  if (
    lowercasedValue === "hardhat" ||
    lowercasedValue === "foundry" ||
    lowercasedValue === "none"
  ) {
    return lowercasedValue;
  }

  // choose from cli prompts
  return null;
}
