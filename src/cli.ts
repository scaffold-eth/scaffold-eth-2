import { createProject } from "./main";
import { parseArgumentsIntoOptions } from "./utils/parse-arguments-into-options";
import { promptForMissingOptions } from "./utils/prompt-for-missing-options";
import { renderIntroMessage } from "./utils/render-intro-message";
import type { Args } from "./types";
import chalk from "chalk";
import { SOLIDITY_FRAMEWORKS } from "./utils/consts";
import { validateFoundryUp } from "./utils/system-validation";
import { showHelpMessage } from "./utils/show-help-message";

export async function cli(args: Args) {
  try {
    renderIntroMessage();
    const { rawOptions, solidityFrameworkChoices } = await parseArgumentsIntoOptions(args);
    if (rawOptions.help) {
      showHelpMessage();
      return;
    }

    const options = await promptForMissingOptions(rawOptions, solidityFrameworkChoices);
    if (options.solidityFramework === SOLIDITY_FRAMEWORKS.FOUNDRY) {
      await validateFoundryUp();
    }

    await createProject(options);
  } catch (error: any) {
    console.error(chalk.red.bold(error.message || "An unknown error occurred."));
    return;
  }
}
