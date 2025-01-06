import { Options, RawOptions, SolidityFrameworkChoices } from "../types";
import inquirer from "inquirer";
import { SOLIDITY_FRAMEWORKS } from "./consts";
import { validateNpmName } from "./validate-name";
import { basename, resolve } from "path";

// default values for unspecified args
const defaultOptions: RawOptions = {
  project: "my-dapp-example",
  solidityFramework: null,
  install: true,
  dev: false,
  externalExtension: null,
  help: false,
};

export async function promptForMissingOptions(
  options: RawOptions,
  solidityFrameworkChoices: SolidityFrameworkChoices,
): Promise<Options> {
  const cliAnswers = Object.fromEntries(Object.entries(options).filter(([, value]) => value !== null));
  const questions = [
    {
      type: "input",
      name: "project",
      message: "Your project name:",
      default: defaultOptions.project,
      validate: (name: string) => {
        const validation = validateNpmName(basename(resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Project " + validation.problems[0];
      },
    },
    {
      type: "list",
      name: "solidityFramework",
      message: "What solidity framework do you want to use?",
      choices: solidityFrameworkChoices,
      default: SOLIDITY_FRAMEWORKS.HARDHAT,
    },
  ];

  const answers = await inquirer.prompt(questions, cliAnswers);

  const solidityFramework = options.solidityFramework ?? answers.solidityFramework;
  const mergedOptions: Options = {
    project: options.project ?? answers.project,
    install: options.install,
    dev: options.dev ?? defaultOptions.dev,
    solidityFramework: solidityFramework === "none" ? null : solidityFramework,
    externalExtension: options.externalExtension,
  };

  return mergedOptions;
}
