import { Options, RawOptions, SolidityFrameworkChoices } from "../types";
import { input, select } from "@inquirer/prompts";
import { SOLIDITY_FRAMEWORKS } from "./consts";
import { validateNpmName } from "./validate-name";

const defaultOptions = {
  project: "my-dapp-example",
  solidityFramework: null,
  install: true,
  dev: false,
  externalExtension: null,
  help: false,
} as const satisfies RawOptions;

export async function promptForMissingOptions(
  options: RawOptions,
  solidityFrameworkChoices: SolidityFrameworkChoices,
): Promise<Options> {
  const project =
    options.project ??
    (await input({
      message: "Your project name:",
      default: defaultOptions.project,
      validate: (name: string) => {
        const validation = validateNpmName(name);
        if (validation.valid) {
          return true;
        }
        return "Project " + validation.problems[0];
      },
    }));

  const solidityFramework =
    options.solidityFramework ??
    (await select({
      message: "What solidity framework do you want to use?",
      choices: solidityFrameworkChoices.map(choice =>
        typeof choice === "string" ? { value: choice, name: choice } : choice,
      ),
      default: SOLIDITY_FRAMEWORKS.HARDHAT,
    }));

  const mergedOptions: Options = {
    project,
    install: options.install,
    dev: options.dev ?? defaultOptions.dev,
    solidityFramework: solidityFramework === "none" ? null : solidityFramework,
    externalExtension: options.externalExtension,
  };

  return mergedOptions;
}
