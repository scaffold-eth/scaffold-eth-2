import config from "../config";
import {
  Extension,
  ExtensionDescriptor,
  Options,
  RawOptions,
  extensionWithSubextensions,
  isDefined,
  isExtension
} from "../types";
import inquirer, { Answers } from "inquirer";
import { extensionDict } from "./extensions-tree";

// default values for unspecified args
const defaultOptions: RawOptions = {
  project: "my-dapp-example",
  install: true,
  dev: false,
  extensions: [],
};

const invalidQuestionNames = ["project", "install"];
const nullExtensionChoice = {
  name: 'None',
  value: null
}

export async function promptForMissingOptions(
  options: RawOptions
): Promise<Options> {
  const cliAnswers = Object.fromEntries(
    Object.entries(options).filter(([key, value]) => value !== null)
  );
  const questions = [];

  questions.push({
    type: "input",
    name: "project",
    message: "Your project name:",
    default: defaultOptions.project,
    validate: (value: string) => value.length > 0,
  });

  const recurringAddFollowUps = (
    extensions: ExtensionDescriptor[],
    relatedQuestion: string
  ) => {
    extensions.filter(extensionWithSubextensions).forEach((ext) => {
      const nestedExtensions = ext.extensions.map(
        (nestedExt) => extensionDict[nestedExt]
      );
      questions.push({
        // INFO: assuming nested extensions are all optional. To change this,
        // update ExtensionDescriptor adding type, and update code here.
        type: "checkbox",
        name: `${ext.value}-extensions`,
        message: `Select optional extensions for ${ext.name}`,
        choices: nestedExtensions,
        when: (answers: Answers) => {
          const relatedResponse = answers[relatedQuestion];
          const wasMultiselectResponse = Array.isArray(relatedResponse);
          return wasMultiselectResponse
            ? relatedResponse.includes(ext.value)
            : relatedResponse === ext.value;
        },
      });
      recurringAddFollowUps(nestedExtensions, `${ext.value}-extensions`);
    });
  };

  config.questions.forEach((question) => {
    if (invalidQuestionNames.includes(question.name)) {
      throw new Error(
        `The name of the question can't be "${
          question.name
        }". The invalid names are: ${invalidQuestionNames
          .map((w) => `"${w}"`)
          .join(", ")}`
      );
    }
    const extensions = question.extensions
      .filter(isExtension)
      .map((ext) => extensionDict[ext])
      .filter(isDefined);

    const hasNoneOption = question.extensions.includes(null)

    questions.push({
      type: question.type === "multi-select" ? "checkbox" : "list",
      name: question.name,
      message: question.message,
      choices: hasNoneOption ? [...extensions, nullExtensionChoice] : extensions,
    });

    recurringAddFollowUps(extensions, question.name);
  });

  questions.push({
    type: "confirm",
    name: "install",
    message: "Install packages?",
    default: defaultOptions.install,
  });

  const answers = await inquirer.prompt(questions, cliAnswers);

  const mergedOptions: Options = {
    project: options.project ?? answers.project,
    install: options.install ?? answers.install,
    dev: options.dev ?? defaultOptions.dev,
    extensions: [],
  };

  config.questions.forEach((question) => {
    const { name } = question;
    const choice: Extension[] = [answers[name]].flat().filter(isDefined);
    mergedOptions.extensions.push(...choice);
  });

  const recurringAddNestedExtensions = (baseExtensions: Extension[]) => {
    baseExtensions.forEach((extValue) => {
      const nestedExtKey = `${extValue}-extensions`;
      const nestedExtensions = answers[nestedExtKey];
      if (nestedExtensions) {
        mergedOptions.extensions.push(...nestedExtensions);
        recurringAddNestedExtensions(nestedExtensions);
      }
    });
  };

  recurringAddNestedExtensions(mergedOptions.extensions);

  return mergedOptions;
}
