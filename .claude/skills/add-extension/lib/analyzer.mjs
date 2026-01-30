import fs from 'fs';
import path from 'path';

/**
 * Detects if extension has both hardhat and foundry packages
 * @param {string[]} extensionFiles - List of extension file paths
 * @returns {{ hasHardhat: boolean, hasFoundry: boolean, hasBoth: boolean }}
 */
export function detectFrameworks(extensionFiles) {
  const hasHardhat = extensionFiles.some(f => f.startsWith('packages/hardhat/'));
  const hasFoundry = extensionFiles.some(f => f.startsWith('packages/foundry/'));

  return {
    hasHardhat,
    hasFoundry,
    hasBoth: hasHardhat && hasFoundry
  };
}

/**
 * Filters extension files to only include chosen framework
 * @param {string[]} extensionFiles - List of extension file paths
 * @param {string} framework - 'hardhat' or 'foundry'
 * @returns {string[]} - Filtered file list
 */
export function filterByFramework(extensionFiles, framework) {
  const otherFramework = framework === 'hardhat' ? 'foundry' : 'hardhat';

  return extensionFiles.filter(file => {
    // Keep all files except those in the other framework's packages dir
    return !file.startsWith(`packages/${otherFramework}/`);
  });
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
    readme: null,
    argsMerges: [],
    templateMerges: []
  };

  // Track which .template.mjs files have corresponding .args.mjs files
  const argsFiles = new Set(
    extensionFiles
      .filter(f => f.endsWith('.args.mjs'))
      .map(f => f.replace('.args.mjs', ''))
  );

  for (const file of extensionFiles) {
    // Handle .args.mjs files - these contain merge instructions for existing files
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

      // Only process if there's no corresponding .args.mjs
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

    // Special handling for package.json files
    if (file === 'package.json') {
      changes.packageJson = analyzePackageJson(extensionFilePath, projectFilePath);
      continue;
    }

    // Handle workspace package.json files (packages/*/package.json)
    if (file.endsWith('package.json') && file.includes('packages/')) {
      // Check if the workspace package.json already exists
      if (fs.existsSync(projectFilePath)) {
        // Existing workspace package.json - merge it
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
        // New workspace package.json - copy as new file
        changes.new.push({
          path: file,
          extensionFile: extensionFilePath,
          projectFile: projectFilePath
        });
      }
      continue;
    }

    // Special handling for README
    if (file === 'README.md' || file.endsWith('README.md.args.mjs')) {
      // We'll handle README separately for appending content
      if (fs.existsSync(projectFilePath.replace('.args.mjs', ''))) {
        changes.readme = {
          extension: extensionFilePath,
          existing: projectFilePath.replace('.args.mjs', '')
        };
      }
      continue;
    }

    // Check if file exists in project
    if (fs.existsSync(projectFilePath)) {
      // File exists - needs merging
      changes.modified.push({
        path: file,
        extensionFile: extensionFilePath,
        projectFile: projectFilePath
      });
    } else {
      // New file - can copy directly
      changes.new.push({
        path: file,
        extensionFile: extensionFilePath,
        projectFile: projectFilePath
      });
    }
  }

  return changes;
}

/**
 * Analyzes package.json differences
 * @param {string} extensionPkgPath - Extension package.json path
 * @param {string} projectPkgPath - Project package.json path
 * @returns {{ dependencies: object, devDependencies: object, scripts: object } | null}
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

    // Find new/updated dependencies
    if (extensionPkg.dependencies) {
      for (const [name, version] of Object.entries(extensionPkg.dependencies)) {
        if (!projectPkg.dependencies?.[name]) {
          changes.dependencies[name] = version;
        } else if (projectPkg.dependencies[name] !== version) {
          changes.dependencies[name] = {
            current: projectPkg.dependencies[name],
            new: version
          };
        }
      }
    }

    // Find new/updated devDependencies
    if (extensionPkg.devDependencies) {
      for (const [name, version] of Object.entries(extensionPkg.devDependencies)) {
        if (!projectPkg.devDependencies?.[name]) {
          changes.devDependencies[name] = version;
        } else if (projectPkg.devDependencies[name] !== version) {
          changes.devDependencies[name] = {
            current: projectPkg.devDependencies[name],
            new: version
          };
        }
      }
    }

    // Find new/updated scripts
    if (extensionPkg.scripts) {
      for (const [name, script] of Object.entries(extensionPkg.scripts)) {
        if (!projectPkg.scripts?.[name]) {
          changes.scripts[name] = script;
        } else if (projectPkg.scripts[name] !== script) {
          changes.scripts[name] = {
            current: projectPkg.scripts[name],
            new: script
          };
        }
      }
    }

    // Check if there are any changes
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
 * Generates a human-readable summary of changes
 * @param {ChangeSet} changes - Change set from analyzeChanges
 * @returns {string}
 */
export function generateChangeSummary(changes) {
  const lines = [];

  lines.push('Extension Changes Summary:');
  lines.push('');

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
      Object.entries(pkg.dependencies).forEach(([name, version]) => {
        if (typeof version === 'string') {
          lines.push(`    + ${name}@${version}`);
        } else {
          lines.push(`    ~ ${name}: ${version.current} → ${version.new}`);
        }
      });
    }

    if (Object.keys(pkg.devDependencies).length > 0) {
      lines.push('  DevDependencies:');
      Object.entries(pkg.devDependencies).forEach(([name, version]) => {
        if (typeof version === 'string') {
          lines.push(`    + ${name}@${version}`);
        } else {
          lines.push(`    ~ ${name}: ${version.current} → ${version.new}`);
        }
      });
    }

    if (Object.keys(pkg.scripts).length > 0) {
      lines.push('  Scripts:');
      Object.entries(pkg.scripts).forEach(([name, script]) => {
        if (typeof script === 'string') {
          lines.push(`    + ${name}`);
        } else {
          lines.push(`    ~ ${name}`);
        }
      });
    }

    lines.push('');
  }

  if (changes.readme) {
    lines.push('README.md will be updated with extension docs');
    lines.push('');
  }

  if (changes.workspacePackages.length > 0) {
    lines.push('Workspace package.json changes:');
    changes.workspacePackages.forEach(wp => {
      lines.push(`  ${wp.path}:`);
      const pkg = wp.changes;

      if (Object.keys(pkg.dependencies).length > 0) {
        Object.entries(pkg.dependencies).forEach(([name, version]) => {
          if (typeof version === 'string') {
            lines.push(`    + ${name}@${version}`);
          } else {
            lines.push(`    ~ ${name}: ${version.current} → ${version.new}`);
          }
        });
      }

      if (Object.keys(pkg.devDependencies).length > 0) {
        Object.entries(pkg.devDependencies).forEach(([name, version]) => {
          if (typeof version === 'string') {
            lines.push(`    + ${name}@${version}`);
          } else {
            lines.push(`    ~ ${name}: ${version.current} → ${version.new}`);
          }
        });
      }

      if (Object.keys(pkg.scripts).length > 0) {
        lines.push(`    Scripts: ${Object.keys(pkg.scripts).join(', ')}`);
      }
    });
    lines.push('');
  }

  if (changes.argsMerges && changes.argsMerges.length > 0) {
    lines.push(`Files to merge via .args.mjs (${changes.argsMerges.length}):`);
    changes.argsMerges.forEach(m => lines.push(`  ~ ${m.targetPath}`));
    lines.push('');
  }

  if (changes.templateMerges && changes.templateMerges.length > 0) {
    lines.push(`Files to generate from templates (${changes.templateMerges.length}):`);
    changes.templateMerges.forEach(m => lines.push(`  + ${m.targetPath}`));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * @typedef {object} ChangeSet
 * @property {Array<{path: string, extensionFile: string, projectFile: string}>} new - New files to create
 * @property {Array<{path: string, extensionFile: string, projectFile: string}>} modified - Files to merge
 * @property {object | null} packageJson - package.json changes
 * @property {Array<{path: string, extensionFile: string, projectFile: string, changes: object}>} workspacePackages - Workspace package.json changes
 * @property {object | null} readme - README changes
 * @property {Array<{argsFile: string, targetFile: string, targetPath: string}>} argsMerges - .args.mjs files to apply
 * @property {Array<{templateFile: string, targetFile: string, targetPath: string}>} templateMerges - Standalone .template.mjs files to apply
 */
