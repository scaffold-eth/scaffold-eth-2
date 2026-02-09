import fs from 'fs';
import path from 'path';

/**
 * Applies deterministic changes to project (copy files, merge package.json).
 * Template-based merges (.args.mjs, .template.mjs) are NOT applied here —
 * they are reported as pending AI merge tasks for Claude to handle.
 *
 * @param {ChangeSet} changes - Changes from analyzer
 * @param {string} projectPath - Project root path
 * @param {object} options - Merge options
 * @returns {{ applied: string[], pendingAI: string[], errors: string[] }}
 */
export function applyDeterministicChanges(changes, projectPath, options = {}) {
  const result = {
    applied: [],
    pendingAI: [],
    errors: []
  };

  // 1. Copy new files
  if (changes.new.length > 0) {
    console.log('\nCopying new files...');
    for (const file of changes.new) {
      try {
        if (!options.dryRun) {
          copyFile(file.extensionFile, file.projectFile, projectPath);
        }
        result.applied.push(file.path);
        console.log(`  + ${file.path}`);
      } catch (error) {
        result.errors.push(`${file.path}: ${error.message}`);
        console.error(`  x ${file.path}: ${error.message}`);
      }
    }
  }

  // 2. Merge root package.json
  if (changes.packageJson) {
    console.log('\nMerging package.json...');
    try {
      if (!options.dryRun) {
        mergePackageJson(changes.packageJson, projectPath);
      }
      result.applied.push('package.json');
      console.log('  + package.json updated');
    } catch (error) {
      result.errors.push(`package.json: ${error.message}`);
      console.error(`  x package.json: ${error.message}`);
    }
  }

  // 3. Merge workspace package.json files
  if (changes.workspacePackages?.length > 0) {
    console.log('\nMerging workspace package.json files...');
    for (const wp of changes.workspacePackages) {
      try {
        if (!options.dryRun) {
          mergePackageJson(wp.changes, path.dirname(wp.projectFile));
        }
        result.applied.push(wp.path);
        console.log(`  + ${wp.path}`);
      } catch (error) {
        result.errors.push(`${wp.path}: ${error.message}`);
        console.error(`  x ${wp.path}: ${error.message}`);
      }
    }
  }

  // 4. Register new workspaces in root package.json
  if (changes.newWorkspaces?.length > 0) {
    console.log('\nRegistering new workspaces...');
    try {
      if (!options.dryRun) {
        registerNewWorkspaces(changes.newWorkspaces, projectPath);
      }
      for (const workspace of changes.newWorkspaces) {
        result.applied.push(workspace);
        console.log(`  + ${workspace}`);
      }
    } catch (error) {
      result.errors.push(`workspaces: ${error.message}`);
      console.error(`  x Failed to register workspaces: ${error.message}`);
    }
  }

  // 5. Report modified files as pending AI merge
  if (changes.modified.length > 0) {
    for (const file of changes.modified) {
      result.pendingAI.push(file.path);
    }
  }

  // 6. Report .args.mjs merges as pending AI merge
  if (changes.argsMerges?.length > 0) {
    for (const merge of changes.argsMerges) {
      result.pendingAI.push(merge.targetPath);
    }
  }

  // 7. Report standalone .template.mjs as pending AI merge
  if (changes.templateMerges?.length > 0) {
    for (const merge of changes.templateMerges) {
      result.pendingAI.push(merge.targetPath);
    }
  }

  return result;
}

/**
 * Validates that a destination path is within the project root (prevents path traversal)
 */
function validateDestPath(dest, projectPath) {
  const resolved = path.resolve(dest);
  const resolvedProject = path.resolve(projectPath);
  if (!resolved.startsWith(resolvedProject + path.sep) && resolved !== resolvedProject) {
    throw new Error(`Path traversal detected: ${dest} resolves outside project root`);
  }
}

/**
 * Copies a file, creating directories as needed
 */
function copyFile(source, dest, projectPath) {
  if (projectPath) {
    validateDestPath(dest, projectPath);
  }
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
      console.warn(`  ! ${sectionLabel} conflict: ${name} (keeping ${value.current})`);
    }
  }
}

/**
 * Merges package.json changes
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
 * Registers new workspace packages in root package.json
 */
function registerNewWorkspaces(newWorkspaces, projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  let workspacesList;
  if (Array.isArray(pkg.workspaces)) {
    workspacesList = pkg.workspaces;
  } else if (pkg.workspaces?.packages) {
    workspacesList = pkg.workspaces.packages;
  } else {
    pkg.workspaces = { packages: [] };
    workspacesList = pkg.workspaces.packages;
  }

  for (const workspace of newWorkspaces) {
    if (!workspacesList.includes(workspace)) {
      workspacesList.push(workspace);
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

/**
 * Generates final summary
 */
export function showSummary(result, extensionName) {
  console.log('\n' + '='.repeat(50));
  console.log(`Extension "${extensionName}" - deterministic merge done`);
  console.log('='.repeat(50));

  if (result.applied.length > 0) {
    console.log(`\nApplied: ${result.applied.length} files`);
  }

  if (result.pendingAI.length > 0) {
    console.log(`\nPending AI merge: ${result.pendingAI.length} files`);
    result.pendingAI.forEach(f => console.log(`  - ${f}`));
  }

  if (result.errors.length > 0) {
    console.log(`\nErrors: ${result.errors.length}`);
    result.errors.forEach(e => console.log(`  - ${e}`));
  }
}
