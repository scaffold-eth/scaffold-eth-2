import { createProject } from "./main";
import { parseArgumentsIntoOptions } from "./utils/parse-arguments-into-options";
import { promptForMissingOptions } from "./utils/prompt-for-missing-options";
import { renderIntroMessage } from "./utils/render-intro-message";
import type { Args } from "./types";
import chalk from "chalk";
import { SOLIDITY_FRAMEWORKS } from "./utils/consts";
import { validateFoundry, checkSystemRequirements } from "./utils/system-validation";
import { showHelpMessage } from "./utils/show-help-message";

export async function cli(args: Args) {
  try {
    renderIntroMessage();

    const { errors } = await checkSystemRequirements();

    if (errors.length > 0) {
      console.log(chalk.red("\n❌ Create-eth requirements not met:"));
      errors.forEach(error => console.log(chalk.red(`  - ${error}`)));
      process.exit(1);
    }

    const { rawOptions, solidityFrameworkChoices } = await parseArgumentsIntoOptions(args);
    if (rawOptions.help) {
      showHelpMessage();
      return;
    }

    const options = await promptForMissingOptions(rawOptions, solidityFrameworkChoices);
    if (options.solidityFramework === SOLIDITY_FRAMEWORKS.FOUNDRY) {
      await validateFoundry();
    }

    await createProject(options);
  } catch (error: any) {
    console.log("%s Error occurred", chalk.red.bold("ERROR"), error);
    console.log("%s Exiting...", chalk.red.bold("Uh oh! 😕 Sorry about that!"));
    process.exitCode = 1;
    return;
  }
}
