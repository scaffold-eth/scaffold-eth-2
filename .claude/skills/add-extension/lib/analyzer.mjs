import fs from 'fs';
import path from 'path';
import { normalizePath } from './templateUtils.mjs';

/**
 * Detects if extension has both hardhat and foundry packages
 * @param {string[]} extensionFiles - List of extension file paths
 * @returns {{ hasHardhat: boolean, hasFoundry: boolean, hasBoth: boolean }}
 */
export function detectFrameworks(extensionFiles) {
  const hasHardhat = extensionFiles.some(f => normalizePath(f).startsWith('packages/hardhat/'));
  const hasFoundry = extensionFiles.some(f => normalizePath(f).startsWith('packages/foundry/'));

  return { hasHardhat, hasFoundry, hasBoth: hasHardhat && hasFoundry };
}

/**
 * Filters extension files to only include chosen framework
 * @param {string[]} extensionFiles - List of extension file paths
 * @param {string} framework - 'hardhat' or 'foundry'
 * @returns {string[]} - Filtered file list
 */
export function filterByFramework(extensionFiles, framework) {
  const exclude = framework === 'hardhat' ? 'packages/foundry/' : 'packages/hardhat/';
  return extensionFiles.filter(f => !normalizePath(f).startsWith(exclude));
}

/**
 * Analyzes changes between extension files and existing project
 * @param {string} extensionPath - Path to extension files
 * @param {string[]} extensionFiles - List of extension file paths
 * @param {string} projectPath - Project root path
 * @returns {ChangeSet}
 */
export function analyzeChanges(extensionPath, extensionFiles, projectPath) {
  const changes = {
    new: [],
    modified: [],
    packageJson: null,
    workspacePackages: [],
    newWorkspaces: [], // Track new workspace directories
    readme: null,
    argsMerges: [],
    templateMerges: []
  };

  // Get existing workspaces from root package.json to avoid duplicates
  const existingWorkspaces = new Set();
  try {
    const rootPkgPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(rootPkgPath)) {
      const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
      if (Array.isArray(rootPkg.workspaces)) {
        rootPkg.workspaces.forEach(w => existingWorkspaces.add(w));
      } else if (rootPkg.workspaces?.packages) {
        rootPkg.workspaces.packages.forEach(w => existingWorkspaces.add(w));
      }
    }
  } catch (error) {
    // If we can't read root package.json, continue anyway
  }

  // Track which .template.mjs files have corresponding .args.mjs files
  const argsFiles = new Set(
    extensionFiles
      .filter(f => f.endsWith('.args.mjs'))
      .map(f => f.replace('.args.mjs', ''))
  );

  // Track packages with package.json for workspace detection
  const pkgPattern = /^packages\/([^/]+)\/package\.json$/;
  const extensionPackages = new Set(
    extensionFiles
      .map(f => normalizePath(f).match(pkgPattern))
      .filter(Boolean)
      .map(m => m[1])
  );

  for (const file of extensionFiles) {
    // Handle .args.mjs files
    if (file.endsWith('.args.mjs')) {
      const targetFile = file.replace('.args.mjs', '');
      const argsFilePath = path.join(extensionPath, file);
      const targetFilePath = path.join(projectPath, targetFile);

      changes.argsMerges.push({
        argsFile: argsFilePath,
        targetFile: targetFilePath,
        targetPath: targetFile
      });
      continue;
    }

    // Handle standalone .template.mjs files (without .args.mjs)
    if (file.endsWith('.template.mjs')) {
      const targetFile = file.replace('.template.mjs', '');

      if (!argsFiles.has(targetFile)) {
        const templateFilePath = path.join(extensionPath, file);
        const targetFilePath = path.join(projectPath, targetFile);

        changes.templateMerges.push({
          templateFile: templateFilePath,
          targetFile: targetFilePath,
          targetPath: targetFile
        });
      }
      continue;
    }

    const extensionFilePath = path.join(extensionPath, file);
    const projectFilePath = path.join(projectPath, file);

    // Root package.json
    if (file === 'package.json') {
      changes.packageJson = analyzePackageJson(extensionFilePath, projectFilePath);
      continue;
    }

    // Workspace package.json files
    const normalizedFile = normalizePath(file);
    if (file.endsWith('package.json') && normalizedFile.includes('packages/')) {
      if (fs.existsSync(projectFilePath)) {
        const pkgChanges = analyzePackageJson(extensionFilePath, projectFilePath);
        if (pkgChanges) {
          changes.workspacePackages.push({
            path: file,
            extensionFile: extensionFilePath,
            projectFile: projectFilePath,
            changes: pkgChanges
          });
        }
      } else {
        changes.new.push({
          path: file,
          extensionFile: extensionFilePath,
          projectFile: projectFilePath
        });
      }
      continue;
    }

    // README handling
    if (file === 'README.md' || file.endsWith('README.md.args.mjs')) {
      if (fs.existsSync(projectFilePath.replace('.args.mjs', ''))) {
        changes.readme = {
          extension: extensionFilePath,
          existing: projectFilePath.replace('.args.mjs', '')
        };
      }
      continue;
    }

    // Regular files
    if (fs.existsSync(projectFilePath)) {
      changes.modified.push({
        path: file,
        extensionFile: extensionFilePath,
        projectFile: projectFilePath
      });
    } else {
      changes.new.push({
        path: file,
        extensionFile: extensionFilePath,
        projectFile: projectFilePath
      });
    }
  }

  // Detect new workspace packages that need registration
  // Add packages that: (1) have a package.json in extension, (2) aren't already registered
  for (const pkgName of extensionPackages) {
    const workspaceKey = `packages/${pkgName}`;

    // Skip if already registered in root package.json
    if (existingWorkspaces.has(workspaceKey)) {
      continue;
    }

    // Register as new workspace (even if directory exists but isn't registered)
    changes.newWorkspaces.push(workspaceKey);
  }

  return changes;
}

/**
 * Analyzes package.json differences
 */
function analyzePackageJson(extensionPkgPath, projectPkgPath) {
  if (!fs.existsSync(extensionPkgPath)) {
    return null;
  }

  try {
    const extensionPkg = JSON.parse(fs.readFileSync(extensionPkgPath, 'utf8'));
    const projectPkg = fs.existsSync(projectPkgPath)
      ? JSON.parse(fs.readFileSync(projectPkgPath, 'utf8'))
      : {};

    const changes = {
      dependencies: {},
      devDependencies: {},
      scripts: {},
      workspaces: null
    };

    // Analyze each section
    analyzePkgSection(extensionPkg.dependencies, projectPkg.dependencies, changes.dependencies);
    analyzePkgSection(extensionPkg.devDependencies, projectPkg.devDependencies, changes.devDependencies);
    analyzePkgSection(extensionPkg.scripts, projectPkg.scripts, changes.scripts);

    const hasChanges =
      Object.keys(changes.dependencies).length > 0 ||
      Object.keys(changes.devDependencies).length > 0 ||
      Object.keys(changes.scripts).length > 0;

    return hasChanges ? changes : null;
  } catch (error) {
    console.warn(`Failed to analyze package.json: ${error.message}`);
    return null;
  }
}

/**
 * Analyzes differences in a package.json section
 */
function analyzePkgSection(extSection, projSection, changes) {
  if (!extSection) return;

  for (const [name, value] of Object.entries(extSection)) {
    if (!projSection?.[name]) {
      changes[name] = value;
    } else if (projSection[name] !== value) {
      changes[name] = {
        current: projSection[name],
        new: value
      };
    }
  }
}

/**
 * Formats dependency changes for display
 */
function formatDependencyChanges(deps, indent = '    ') {
  const lines = [];
  for (const [name, version] of Object.entries(deps)) {
    if (typeof version === 'string') {
      lines.push(`${indent}+ ${name}@${version}`);
    } else {
      lines.push(`${indent}~ ${name}: ${version.current} → ${version.new}`);
    }
  }
  return lines;
}

/**
 * Generates a human-readable summary of changes
 * @param {ChangeSet} changes - Change set from analyzeChanges
 * @returns {string}
 */
export function generateChangeSummary(changes) {
  const lines = ['Extension Changes Summary:', ''];

  if (changes.new.length > 0) {
    lines.push(`New files (${changes.new.length}):`);
    changes.new.forEach(f => lines.push(`  + ${f.path}`));
    lines.push('');
  }

  if (changes.modified.length > 0) {
    lines.push(`Modified files (${changes.modified.length}):`);
    changes.modified.forEach(f => lines.push(`  ~ ${f.path}`));
    lines.push('');
  }

  if (changes.packageJson) {
    lines.push('package.json changes:');
    const pkg = changes.packageJson;

    if (Object.keys(pkg.dependencies).length > 0) {
      lines.push('  Dependencies:');
      lines.push(...formatDependencyChanges(pkg.dependencies));
    }

    if (Object.keys(pkg.devDependencies).length > 0) {
      lines.push('  DevDependencies:');
      lines.push(...formatDependencyChanges(pkg.devDependencies));
    }

    if (Object.keys(pkg.scripts).length > 0) {
      lines.push('  Scripts:');
      for (const [name, script] of Object.entries(pkg.scripts)) {
        lines.push(typeof script === 'string' ? `    + ${name}` : `    ~ ${name}`);
      }
    }

    lines.push('');
  }

  if (changes.readme) {
    lines.push('README.md will be updated with extension docs', '');
  }

  if (changes.workspacePackages.length > 0) {
    lines.push('Workspace package.json changes:');
    for (const wp of changes.workspacePackages) {
      lines.push(`  ${wp.path}:`);
      const pkg = wp.changes;

      if (Object.keys(pkg.dependencies).length > 0) {
        lines.push(...formatDependencyChanges(pkg.dependencies));
      }

      if (Object.keys(pkg.devDependencies).length > 0) {
        lines.push(...formatDependencyChanges(pkg.devDependencies));
      }

      if (Object.keys(pkg.scripts).length > 0) {
        lines.push(`    Scripts: ${Object.keys(pkg.scripts).join(', ')}`);
      }
    }
    lines.push('');
  }

  if (changes.argsMerges?.length > 0) {
    lines.push(`Files to merge via .args.mjs (${changes.argsMerges.length}):`);
    changes.argsMerges.forEach(m => lines.push(`  ~ ${m.targetPath}`));
    lines.push('');
  }

  if (changes.templateMerges?.length > 0) {
    lines.push(`Files to generate from templates (${changes.templateMerges.length}):`);
    changes.templateMerges.forEach(m => lines.push(`  + ${m.targetPath}`));
    lines.push('');
  }

  if (changes.newWorkspaces?.length > 0) {
    lines.push(`New workspaces to register (${changes.newWorkspaces.length}):`);
    changes.newWorkspaces.forEach(w => lines.push(`  + ${w}`));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * @typedef {object} ChangeSet
 * @property {Array<{path: string, extensionFile: string, projectFile: string}>} new
 * @property {Array<{path: string, extensionFile: string, projectFile: string}>} modified
 * @property {object | null} packageJson
 * @property {Array<{path: string, extensionFile: string, projectFile: string, changes: object}>} workspacePackages
 * @property {string[]} newWorkspaces
 * @property {object | null} readme
 * @property {Array<{argsFile: string, targetFile: string, targetPath: string}>} argsMerges
 * @property {Array<{templateFile: string, targetFile: string, targetPath: string}>} templateMerges
 */
