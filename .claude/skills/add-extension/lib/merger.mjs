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

  // 2. Apply .args.mjs merges (template-based only)
  if (changes.argsMerges?.length > 0) {
    console.log('\nMerging files with .args.mjs instructions...');
    for (const merge of changes.argsMerges) {
      try {
        if (!options.dryRun) {
          let applied = false;

          if (options.extensionName && options.extensionsRepoPath) {
            const preview = await previewTemplateMerge(
              merge.argsFile,
              merge.targetFile,
              projectPath,
              options.extensionsRepoPath,
              options.extensionName
            );

            if (preview.success) {
              // Skip prompt if --yes flag is set
              const confirmed = options.yes || await promptArgsMerge(merge.targetPath, preview);

              if (confirmed) {
                applied = await applyTemplateMerge(
                  merge.argsFile,
                  merge.targetFile,
                  projectPath,
                  options.extensionsRepoPath,
                  options.extensionName,
                  { verbose: options.verbose }
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

  // 3. Apply standalone .template.mjs files
  if (changes.templateMerges?.length > 0) {
    console.log('\nGenerating files from standalone templates...');
    for (const merge of changes.templateMerges) {
      try {
        if (!options.dryRun) {
          const applied = await applyStandaloneTemplate(
            merge.templateFile,
            merge.targetFile,
            projectPath,
            { verbose: options.verbose }
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

  // 4. Handle modified files (needs manual merge)
  if (changes.modified.length > 0) {
    console.log('\nModified files detected (manual merge required):');
    for (const file of changes.modified) {
      console.log(`  ~ ${file.path}`);
      result.skipped.push(file.path);
    }
    console.log('\nUse Claude to merge these files manually.');
  }

  // 5. Merge package.json
  if (changes.packageJson) {
    console.log('\nMerging package.json...');
    try {
      if (!options.dryRun) {
        mergePackageJson(changes.packageJson, projectPath);
      }
      result.applied.push('package.json');
      console.log('  ✓ package.json updated');
    } catch (error) {
      result.errors.push(`package.json: ${error.message}`);
      console.error(`  ✗ package.json: ${error.message}`);
    }
  }

  // 6. Merge workspace package.json files
  if (changes.workspacePackages?.length > 0) {
    console.log('\nMerging workspace package.json files...');
    for (const wp of changes.workspacePackages) {
      try {
        if (!options.dryRun) {
          mergePackageJson(wp.changes, path.dirname(wp.projectFile));
        }
        result.applied.push(wp.path);
        console.log(`  ✓ ${wp.path}`);
      } catch (error) {
        result.errors.push(`${wp.path}: ${error.message}`);
        console.error(`  ✗ ${wp.path}: ${error.message}`);
      }
    }
  }

  // 7. Append README content
  if (changes.readme) {
    console.log('\nREADME.md needs manual update');
    result.skipped.push('README.md');
  }

  return result;
}

/**
 * Prompts user to confirm .args merge with preview
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
 */
function copyFile(source, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(source, dest);
}

/**
 * Merges a single package.json section
 */
function mergePackageSection(pkg, section, changes, sectionLabel) {
  if (Object.keys(changes).length === 0) return;

  pkg[section] = pkg[section] || {};
  for (const [name, value] of Object.entries(changes)) {
    if (typeof value === 'string') {
      pkg[section][name] = value;
    } else {
      console.warn(`  ⚠ ${sectionLabel} conflict: ${name} (keeping ${value.current})`);
    }
  }
}

/**
 * Merges package.json changes (synchronous)
 */
function mergePackageJson(changes, projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  mergePackageSection(pkg, 'dependencies', changes.dependencies, 'Dependency');
  mergePackageSection(pkg, 'devDependencies', changes.devDependencies, 'DevDependency');
  mergePackageSection(pkg, 'scripts', changes.scripts, 'Script');

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

/**
 * Updates package.json to track installed extension
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
