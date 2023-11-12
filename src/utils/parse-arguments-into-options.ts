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

      "--dev": Boolean,
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

  return {
    project,
    install: hasInstallRelatedFlag ? install || !skipInstall : null,
    dev,
    extensions: null, // TODO add extensions flags
  };
}
