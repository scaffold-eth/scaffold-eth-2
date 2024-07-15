import { Options, RawOptions } from "../types";
import inquirer from "inquirer";
import { SOLIDITY_FRAMEWORKS } from "./consts";

// default values for unspecified args
const defaultOptions: RawOptions = {
  project: "my-dapp-example",
  solidityFramework: null,
  install: true,
  dev: false,
  externalExtension: null,
  help: false,
};

const nullExtensionChoice = {
  name: "none",
  value: null,
};

export async function promptForMissingOptions(options: RawOptions): Promise<Options> {
  const cliAnswers = Object.fromEntries(Object.entries(options).filter(([, value]) => value !== null));
  const questions = [
    {
      type: "input",
      name: "project",
      message: "Your project name:",
      default: defaultOptions.project,
      validate: (value: string) => value.length > 0,
    },
    {
      type: "list",
      name: "solidityFramework",
      message: "What solidity framework do you want to use?",
      choices: [SOLIDITY_FRAMEWORKS.HARDHAT, SOLIDITY_FRAMEWORKS.FOUNDRY, nullExtensionChoice],
      default: SOLIDITY_FRAMEWORKS.HARDHAT,
    },
  ];

  const answers = await inquirer.prompt(questions, cliAnswers);

  const mergedOptions: Options = {
    project: options.project ?? answers.project,
    install: options.install,
    dev: options.dev ?? defaultOptions.dev,
    solidityFramework: options.solidityFramework ?? answers.solidityFramework,
    externalExtension: options.externalExtension,
  };

  return mergedOptions;
}
