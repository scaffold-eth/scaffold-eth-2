#!/usr/bin/env node

/**
 * /add-extension - Scaffold-ETH-2 Extension Merger Skill
 *
 * Adds extensions to existing SE-2 projects post-creation.
 *
 * Usage:
 *   claude /add-extension <extension-name>
 *   claude /add-extension <extension-name> --dry-run
 *   claude /add-extension <extension-name> --local /path/to/extension
 */

import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import fs from 'fs';
import {
  detectSE2Project,
  checkExtensionInstalled,
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
  mergeFiles,
  trackExtension,
  showSummary
} from './lib/merger.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Main skill entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const extensionName = args[0];
  const options = parseOptions(args.slice(1));

  // Display help if no args
  if (!extensionName || extensionName === '--help' || extensionName === '-h') {
    await showHelp();
    process.exit(0);
  }

  try {
    console.log(`\n🏗️  Scaffold-ETH-2 Extension Merger`);
    console.log(`Adding extension: ${extensionName}\n`);

    // 1. Validate extension name
    const nameValidation = await validateExtensionName(extensionName);
    if (!nameValidation.valid) {
      console.error(`❌ ${nameValidation.reason}`);
      process.exit(1);
    }

    // 2. Detect SE-2 project
    const cwd = process.cwd();
    const projectCheck = detectSE2Project(cwd);

    if (!projectCheck.valid) {
      console.error(`❌ ${projectCheck.reason}`);
      console.error('\nMake sure you\'re in a Scaffold-ETH-2 project root directory.');
      process.exit(1);
    }

    console.log(`✓ Detected SE-2 project (${projectCheck.framework || 'unknown'})`);

    // 3. Check if already installed
    if (checkExtensionInstalled(extensionName, cwd)) {
      console.warn(`\n⚠️  Extension "${extensionName}" is already installed.`);
      if (!options.force) {
        console.log('Use --force to reinstall.\n');
        process.exit(0);
      }
      console.log('Reinstalling (--force)...\n');
    }

    // 4. Fetch extension files
    let extension;
    try {
      extension = await fetchExtension(extensionName, options);
      console.log(`✓ Fetched extension (${extension.files.length} files)\n`);
    } catch (error) {
      console.error(`❌ ${error.message}`);
      process.exit(1);
    }

    // 4.5. Check for framework choice
    let filesToUse = extension.files;
    const frameworks = detectFrameworks(extension.files);

    if (frameworks.hasBoth) {
      let chosenFramework = options.framework;

      // Validate pre-specified framework
      if (chosenFramework && !['hardhat', 'foundry'].includes(chosenFramework)) {
        console.error(`❌ Invalid framework: ${chosenFramework}. Must be 'hardhat' or 'foundry'.`);
        extension.cleanup();
        process.exit(1);
      }

      // Auto-detect from project if not specified
      if (!chosenFramework && projectCheck.framework) {
        chosenFramework = projectCheck.framework;
        console.log(`\n✓ Auto-selected ${chosenFramework} (detected from project)\n`);
      }

      // Prompt if still not specified
      if (!chosenFramework) {
        chosenFramework = await promptFrameworkChoice();
        console.log(`\n✓ Selected ${chosenFramework}\n`);
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
      console.log('🔍 Dry run complete. No changes made.\n');
      extension.cleanup();
      process.exit(0);
    }

    // 7. Apply changes
    console.log('\n📝 Applying changes...');

    // Only use local path if explicitly provided
    const extensionsRepoPath = options.local || undefined;

    const result = await mergeFiles(changes, cwd, {
      ...options,
      extensionName,
      extensionsRepoPath
    });

    // 9. Track extension
    trackExtension(extensionName, cwd);
    console.log(`\n✓ Tracked extension in package.json`);

    // 10. Show summary
    showSummary(result, extensionName);

    // 12. Cleanup
    extension.cleanup();

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    cleanupAllTemp();
    process.exit(1);
  }
}


/**
 * Prompts user to choose framework
 * @returns {Promise<string>} - 'hardhat' or 'foundry'
 */
async function promptFrameworkChoice() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n📦 This extension supports both Hardhat and Foundry.');
    console.log('Which framework do you want to install?');
    console.log('  1) Hardhat (Solidity)');
    console.log('  2) Foundry');

    rl.question('\nChoice (1 or 2): ', (answer) => {
      rl.close();
      const choice = answer.trim();

      if (choice === '1' || choice.toLowerCase() === 'hardhat') {
        resolve('hardhat');
      } else if (choice === '2' || choice.toLowerCase() === 'foundry') {
        resolve('foundry');
      } else {
        console.log('Invalid choice, defaulting to Hardhat');
        resolve('hardhat');
      }
    });
  });
}

/**
 * Parses command-line options
 */
function parseOptions(args) {
  const options = {
    dryRun: false,
    force: false,
    yes: false,
    verbose: false,
    local: null,
    framework: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--force':
      case '-f':
        options.force = true;
        break;
      case '--yes':
      case '-y':
        options.yes = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--local':
      case '-l':
        options.local = args[++i];
        break;
      case '--framework':
        options.framework = args[++i];
        break;
    }
  }

  return options;
}

/**
 * Shows help message
 */
async function showHelp() {
  // Fetch available extensions
  const validation = await validateExtensionName('_dummy_');
  const extensions = validation.extensions || [
    'subgraph', 'x402', 'eip-712', 'ponder', 'erc-20',
    'eip-5792', 'randao', 'erc-721', 'porto', 'envio', 'drizzle-neon'
  ];

  console.log(`
🏗️  Scaffold-ETH-2 Extension Merger

Usage:
  claude /add-extension <extension-name> [options]

Examples:
  claude /add-extension erc-20
  claude /add-extension subgraph --dry-run
  claude /add-extension ponder --framework hardhat
  claude /add-extension erc-721 --local ../create-eth-extensions

Options:
  -d, --dry-run          Preview changes without applying
  -f, --force            Reinstall if already installed
  -y, --yes              Skip confirmation prompts
  -v, --verbose          Show detailed error messages
  -l, --local <path>     Use local extension path (for development)
  --framework <name>     Choose framework (hardhat or foundry) for extensions with both
  -h, --help             Show this help message

Available Extensions:
  ${extensions.join(', ')}
`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
