#!/usr/bin/env node

import fs from 'fs';
import readline from 'readline';
import {
  detectSE2Project,
  validateExtensionName
} from './lib/validator.mjs';
import { fetchExtension, cleanupAllTemp } from './lib/fetcher.mjs';
import {
  analyzeChanges,
  generateChangeSummary,
  detectFrameworks,
  filterByFramework
} from './lib/analyzer.mjs';
import {
  applyDeterministicChanges,
  showSummary
} from './lib/merger.mjs';
import { VALID_FRAMEWORKS } from './lib/constants.mjs';

async function main() {
  const args = process.argv.slice(2);
  const extensionName = args[0];
  const options = parseOptions(args.slice(1));

  if (!extensionName) {
    console.error('Usage: node skill.mjs <extension-name> [options]');
    process.exit(1);
  }

  try {
    console.log(`\nScaffold-ETH-2 Extension Merger`);
    console.log(`Adding extension: ${extensionName}\n`);

    // 1. Validate extension name
    const nameValidation = await validateExtensionName(extensionName);
    if (!nameValidation.valid) {
      console.error(`Error: ${nameValidation.reason}`);
      process.exit(1);
    }

    const extensionConfig = nameValidation.config;

    // 2. Detect SE-2 project
    const cwd = process.cwd();
    const projectCheck = detectSE2Project(cwd);

    if (!projectCheck.valid) {
      console.error(`Error: ${projectCheck.reason}`);
      console.error('\nMake sure you are in a Scaffold-ETH-2 project root directory.');
      process.exit(1);
    }

    console.log(`Detected SE-2 project (${projectCheck.solidityFramework || 'unknown'})`);

    // 3. Fetch extension files
    let extension;
    try {
      extension = await fetchExtension(extensionName, {
        ...options,
        repository: extensionConfig.repository,
        branch: extensionConfig.branch
      });
      console.log(`Fetched extension (${extension.files.length} files)\n`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }

    // 4. Framework selection
    let filesToUse = extension.files;
    const frameworks = detectFrameworks(extension.files);

    if (frameworks.hasBoth) {
      let chosenFramework = null;

      if (projectCheck.solidityFramework) {
        chosenFramework = projectCheck.solidityFramework;
        console.log(`Using ${chosenFramework} (detected from project)\n`);

        if (options.solidityFramework && options.solidityFramework !== chosenFramework) {
          console.error(`Error: Cannot install ${options.solidityFramework} files - project uses ${chosenFramework}`);
          extension.cleanup();
          process.exit(1);
        }
      } else {
        chosenFramework = options.solidityFramework;

        if (chosenFramework && !VALID_FRAMEWORKS.includes(chosenFramework)) {
          console.error(`Error: Invalid framework: ${chosenFramework}. Must be 'hardhat' or 'foundry'.`);
          extension.cleanup();
          process.exit(1);
        }

        if (!chosenFramework) {
          chosenFramework = await promptFrameworkChoice();
          console.log(`\nSelected ${chosenFramework}\n`);
        } else {
          console.log(`Using ${chosenFramework} (specified via --solidity-framework)\n`);
        }
      }

      filesToUse = filterByFramework(extension.files, chosenFramework);
      console.log(`Filtered to ${filesToUse.length} files for ${chosenFramework}\n`);
    }

    // 5. Analyze changes
    const changes = analyzeChanges(extension.path, filesToUse, cwd);
    const summary = generateChangeSummary(changes);
    console.log(summary);

    // 6. Dry run exit
    if (options.dryRun) {
      console.log('Dry run complete. No changes made.\n');
      // Still output AI tasks for visibility
      outputAIMergeTasks(changes);
      extension.cleanup();
      process.exit(0);
    }

    // 7. Apply deterministic changes
    console.log('\nApplying deterministic changes...');
    const result = applyDeterministicChanges(changes, cwd, options);

    // 8. Show summary
    showSummary(result, extensionName);

    // 9. Output AI merge tasks as structured JSON
    outputAIMergeTasks(changes);

    // 10. Read standalone template content before cleanup
    const templateTasks = readTemplateContents(changes);
    if (templateTasks.length > 0) {
      outputTemplateTasks(templateTasks);
    }

    // 11. Cleanup temp files (safe — argsContent is already inlined in JSON)
    extension.cleanup();

  } catch (error) {
    console.error(`\nError: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    cleanupAllTemp();
    process.exit(1);
  }
}

/**
 * Outputs structured AI merge tasks between markers for Claude to parse
 */
function outputAIMergeTasks(changes) {
  const tasks = [];

  // .args.mjs merge tasks
  for (const merge of changes.argsMerges) {
    tasks.push({
      type: 'args_merge',
      targetFile: merge.targetPath,
      exports: merge.exports,
      argsContent: merge.argsContent
    });
  }

  // Modified files — read extension content before cleanup destroys temp files
  for (const file of changes.modified) {
    let extensionContent;
    try {
      extensionContent = fs.readFileSync(file.extensionFile, 'utf8');
    } catch (error) {
      console.error(`Failed to read extension file: ${file.extensionFile}`);
      continue;
    }
    tasks.push({
      type: 'file_conflict',
      targetFile: file.path,
      extensionContent
    });
  }

  if (tasks.length === 0) return;

  console.log('\n--- AI_MERGE_TASKS_BEGIN ---');
  console.log(JSON.stringify(tasks, null, 2));
  console.log('--- AI_MERGE_TASKS_END ---');
}

/**
 * Reads standalone .template.mjs content before cleanup
 */
function readTemplateContents(changes) {
  const tasks = [];

  for (const merge of changes.templateMerges) {
    try {
      const content = fs.readFileSync(merge.templateFile, 'utf8');
      tasks.push({
        type: 'standalone_template',
        targetFile: merge.targetPath,
        templateContent: content
      });
    } catch (error) {
      console.error(`Failed to read template: ${merge.templateFile}`);
    }
  }

  return tasks;
}

/**
 * Outputs standalone template tasks
 */
function outputTemplateTasks(tasks) {
  console.log('\n--- TEMPLATE_TASKS_BEGIN ---');
  console.log(JSON.stringify(tasks, null, 2));
  console.log('--- TEMPLATE_TASKS_END ---');
}

/**
 * Prompts user to choose framework
 */
async function promptFrameworkChoice() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    const askQuestion = () => {
      console.log('\nThis extension supports both Hardhat and Foundry.');
      console.log('Which framework do you want to install?');
      console.log('  1) Hardhat');
      console.log('  2) Foundry');

      rl.question('\nChoice (1 or 2): ', (answer) => {
        const choice = answer.trim().toLowerCase();

        if (choice === '1' || choice === 'hardhat') {
          rl.close();
          resolve('hardhat');
        } else if (choice === '2' || choice === 'foundry') {
          rl.close();
          resolve('foundry');
        } else {
          console.log('Invalid choice. Please enter 1 or 2.');
          askQuestion();
        }
      });
    };

    askQuestion();
  });
}

function parseOptions(args) {
  const options = {
    dryRun: false,
    verbose: false,
    local: null,
    solidityFramework: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--local':
      case '-l':
        if (i + 1 >= args.length) {
          console.error('Error: --local requires a path argument');
          process.exit(1);
        }
        options.local = args[++i];
        break;
      case '--solidity-framework':
      case '-s':
        if (i + 1 >= args.length) {
          console.error('Error: --solidity-framework requires a value (hardhat or foundry)');
          process.exit(1);
        }
        options.solidityFramework = args[++i];
        break;
    }
  }

  return options;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
