import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import { applyTemplateMerge, applyStandaloneTemplate, previewTemplateMerge } from './templateMerger.mjs';

/**
 * Applies changes to project
 * @param {ChangeSet} changes - Changes from analyzer
 * @param {string} projectPath - Project root path
 * @param {object} options - Merge options
 * @param {boolean} [options.dryRun] - Don't actually write files
 * @param {boolean} [options.autoYes] - Skip prompts, approve all
 * @param {string} [options.extensionName] - Name of extension being installed
 * @param {string} [options.extensionsRepoPath] - Path to create-eth-extensions repo
 * @returns {Promise<{ applied: string[], skipped: string[], errors: string[] }>}
 */
export async function mergeFiles(changes, projectPath, options = {}) {
  const result = {
    applied: [],
    skipped: [],
    errors: []
  };

  // 1. Copy new files
  console.log('\nCopying new files...');
  for (const file of changes.new) {
    try {
      if (!options.dryRun) {
        copyFile(file.extensionFile, file.projectFile);
      }
      result.applied.push(file.path);
      console.log(`  ✓ ${file.path}`);
    } catch (error) {
      result.errors.push(`${file.path}: ${error.message}`);
      console.error(`  ✗ ${file.path}: ${error.message}`);
    }
  }

  // 2. Apply .args.mjs merges (template-based only) - with confirmation
  if (changes.argsMerges && changes.argsMerges.length > 0) {
    console.log('\nMerging files with .args.mjs instructions...');
    for (const merge of changes.argsMerges) {
      try {
        if (!options.dryRun) {
          let applied = false;

          // Apply template-based merge (requires extension info)
          if (options.extensionName && options.extensionsRepoPath) {
            // Preview the merge first
            const preview = await previewTemplateMerge(
              merge.argsFile,
              merge.targetFile,
              projectPath,
              options.extensionsRepoPath,
              options.extensionName
            );

            if (preview.success) {
              // Ask user for confirmation
              const confirmed = await promptArgsMerge(merge.targetPath, preview);

              if (confirmed) {
                applied = await applyTemplateMerge(
                  merge.argsFile,
                  merge.targetFile,
                  projectPath,
                  options.extensionsRepoPath,
                  options.extensionName
                );
              } else {
                result.skipped.push(merge.targetPath);
                console.log(`  ⊘ ${merge.targetPath} (user declined)`);
                continue;
              }
            }
          }

          if (applied) {
            result.applied.push(merge.targetPath);
            console.log(`  ✓ ${merge.targetPath}`);
          } else {
            result.skipped.push(merge.targetPath);
            console.log(`  ~ ${merge.targetPath} (template-based merge unavailable)`);
          }
        } else {
          console.log(`  ~ ${merge.targetPath} (dry run)`);
        }
      } catch (error) {
        result.errors.push(`${merge.targetPath}: ${error.message}`);
        console.error(`  ✗ ${merge.targetPath}: ${error.message}`);
      }
    }
  }

  // 2.5. Apply standalone .template.mjs files (without .args.mjs)
  if (changes.templateMerges && changes.templateMerges.length > 0) {
    console.log('\nGenerating files from standalone templates...');
    for (const merge of changes.templateMerges) {
      try {
        if (!options.dryRun) {
          const applied = await applyStandaloneTemplate(
            merge.templateFile,
            merge.targetFile,
            projectPath
          );

          if (applied) {
            result.applied.push(merge.targetPath);
            console.log(`  ✓ ${merge.targetPath}`);
          } else {
            result.skipped.push(merge.targetPath);
            console.log(`  ~ ${merge.targetPath} (no changes)`);
          }
        } else {
          console.log(`  ~ ${merge.targetPath} (dry run)`);
        }
      } catch (error) {
        result.errors.push(`${merge.targetPath}: ${error.message}`);
        console.error(`  ✗ ${merge.targetPath}: ${error.message}`);
      }
    }
  }

  // 3. Handle modified files (needs Claude to merge)
  if (changes.modified.length > 0) {
    console.log('\nModified files detected (manual merge required):');
    for (const file of changes.modified) {
      console.log(`  ~ ${file.path}`);
      result.skipped.push(file.path);
    }
    console.log('\nUse Claude to merge these files manually.');
  }

  // 4. Merge package.json
  if (changes.packageJson) {
    console.log('\nMerging package.json...');
    try {
      if (!options.dryRun) {
        await mergePackageJson(changes.packageJson, projectPath);
      }
      result.applied.push('package.json');
      console.log('  ✓ package.json updated');
    } catch (error) {
      result.errors.push(`package.json: ${error.message}`);
      console.error(`  ✗ package.json: ${error.message}`);
    }
  }

  // 5. Merge workspace package.json files
  if (changes.workspacePackages && changes.workspacePackages.length > 0) {
    console.log('\nMerging workspace package.json files...');
    for (const wp of changes.workspacePackages) {
      try {
        if (!options.dryRun) {
          await mergePackageJson(wp.changes, path.dirname(wp.projectFile));
        }
        result.applied.push(wp.path);
        console.log(`  ✓ ${wp.path}`);
      } catch (error) {
        result.errors.push(`${wp.path}: ${error.message}`);
        console.error(`  ✗ ${wp.path}: ${error.message}`);
      }
    }
  }

  // 6. Append README content
  if (changes.readme) {
    console.log('\nREADME.md needs manual update');
    result.skipped.push('README.md');
  }

  return result;
}

/**
 * Prompts user to confirm .args merge with preview
 * @param {string} targetPath - Target file path
 * @param {object} preview - Preview object with changes
 * @returns {Promise<boolean>} - true if user confirms
 */
async function promptArgsMerge(targetPath, preview) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log(`\n📄 File: ${targetPath}`);
    console.log(`Changes from .args merge:`);

    if (preview.exists) {
      console.log(`  - File exists (${preview.existingLines} lines)`);
      console.log(`  - New content will be ${preview.newLines} lines`);
      if (preview.diff) {
        console.log(`\nPreview (first 10 lines of changes):`);
        console.log(preview.diff);
      }
    } else {
      console.log(`  - New file will be created`);
      console.log(`  - Content will be ${preview.newLines} lines`);
      if (preview.preview) {
        console.log(`\nPreview (first 10 lines):`);
        console.log(preview.preview);
      }
    }

    rl.question('\nApply this merge? (y/n): ', (answer) => {
      rl.close();
      const choice = answer.trim().toLowerCase();
      resolve(choice === 'y' || choice === 'yes');
    });
  });
}

/**
 * Copies a file, creating directories as needed
 * @param {string} source - Source file path
 * @param {string} dest - Destination file path
 */
function copyFile(source, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(source, dest);
}

/**
 * Merges package.json changes
 * @param {object} changes - package.json changes from analyzer
 * @param {string} projectPath - Project root path
 */
async function mergePackageJson(changes, projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  // Merge dependencies
  if (Object.keys(changes.dependencies).length > 0) {
    pkg.dependencies = pkg.dependencies || {};
    for (const [name, version] of Object.entries(changes.dependencies)) {
      if (typeof version === 'string') {
        pkg.dependencies[name] = version;
      } else {
        // Conflict - keep current, warn
        console.warn(`  ⚠ Dependency conflict: ${name} (keeping ${version.current})`);
      }
    }
  }

  // Merge devDependencies
  if (Object.keys(changes.devDependencies).length > 0) {
    pkg.devDependencies = pkg.devDependencies || {};
    for (const [name, version] of Object.entries(changes.devDependencies)) {
      if (typeof version === 'string') {
        pkg.devDependencies[name] = version;
      } else {
        console.warn(`  ⚠ DevDependency conflict: ${name} (keeping ${version.current})`);
      }
    }
  }

  // Merge scripts
  if (Object.keys(changes.scripts).length > 0) {
    pkg.scripts = pkg.scripts || {};
    for (const [name, script] of Object.entries(changes.scripts)) {
      if (typeof script === 'string') {
        pkg.scripts[name] = script;
      } else {
        console.warn(`  ⚠ Script conflict: ${name} (keeping current)`);
      }
    }
  }

  // Write back
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

/**
 * Updates package.json to track installed extension
 * @param {string} extensionName - Extension name
 * @param {string} projectPath - Project root path
 */
export function trackExtension(extensionName, projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  pkg.scaffoldEth = pkg.scaffoldEth || {};
  pkg.scaffoldEth.extensions = pkg.scaffoldEth.extensions || [];

  if (!pkg.scaffoldEth.extensions.includes(extensionName)) {
    pkg.scaffoldEth.extensions.push(extensionName);
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

/**
 * Runs yarn install
 * @param {string} projectPath - Project root path
 * @param {boolean} silent - Suppress output
 */
export function runYarnInstall(projectPath, silent = false) {
  console.log('\nInstalling dependencies...');
  try {
    execSync('yarn install', {
      cwd: projectPath,
      stdio: silent ? 'pipe' : 'inherit'
    });
    console.log('  ✓ Dependencies installed');
  } catch (error) {
    console.error('  ✗ yarn install failed:', error.message);
    throw error;
  }
}

/**
 * Generates final summary
 * @param {object} result - Merge result
 * @param {string} extensionName - Extension name
 */
export function showSummary(result, extensionName) {
  console.log('\n' + '='.repeat(50));
  console.log(`Extension "${extensionName}" merge complete!`);
  console.log('='.repeat(50));

  if (result.applied.length > 0) {
    console.log(`\n✓ Applied: ${result.applied.length} files`);
  }

  if (result.skipped.length > 0) {
    console.log(`\n⚠ Skipped: ${result.skipped.length} files (manual merge needed)`);
    result.skipped.forEach(f => console.log(`  - ${f}`));
  }

  if (result.errors.length > 0) {
    console.log(`\n✗ Errors: ${result.errors.length}`);
    result.errors.forEach(e => console.log(`  - ${e}`));
  }

  console.log('\nNext steps:');
  if (result.skipped.length > 0) {
    console.log('  1. Review and merge skipped files manually');
  }
  console.log('  2. Test your application');
  console.log('  3. Commit changes\n');
}
