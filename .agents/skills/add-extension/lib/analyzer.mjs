import fs from 'fs';
import path from 'path';

/** Normalizes file path separators to forward slashes */
const normalizePath = (p) => p.replace(/\\/g, '/');

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
 * Reads an .args.mjs file as raw text and parses its export names with regex
 * @param {string} argsFilePath - Absolute path to .args.mjs file
 * @returns {{ argsContent: string, exports: Array<{ name: string, type: string }> }}
 */
function readArgsFile(argsFilePath) {
  const content = fs.readFileSync(argsFilePath, 'utf8');
  const exports = [];

  const exportPattern = /export\s+const\s+(\w+)\s*=/g;
  let match;

  while ((match = exportPattern.exec(content)) !== null) {
    exports.push({ name: match[1] });
  }

  return { argsContent: content, exports };
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
    newWorkspaces: [],
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
    // Handle .args.mjs files — read as raw text with parsed exports
    if (file.endsWith('.args.mjs')) {
      const targetFile = file.replace('.args.mjs', '');
      const argsFilePath = path.join(extensionPath, file);
      const targetFilePath = path.join(projectPath, targetFile);

      const { argsContent, exports } = readArgsFile(argsFilePath);

      changes.argsMerges.push({
        argsFile: argsFilePath,
        targetFile: targetFilePath,
        targetPath: targetFile,
        argsContent,
        exports
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
  for (const pkgName of extensionPackages) {
    const workspaceKey = `packages/${pkgName}`;
    if (!existingWorkspaces.has(workspaceKey)) {
      changes.newWorkspaces.push(workspaceKey);
    }
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
 * Generates a human-readable summary of changes
 */
export function generateChangeSummary(changes) {
  const lines = ['Extension Changes Summary:', ''];

  const sections = [
    [changes.new, 'New files', f => `  + ${f.path}`],
    [changes.modified, 'Modified files', f => `  ~ ${f.path}`],
    [changes.argsMerges, 'AI merge (.args.mjs)', m => `  ~ ${m.targetPath} [${m.exports.map(e => e.name).join(', ')}]`],
    [changes.templateMerges, 'Standalone templates', m => `  + ${m.targetPath}`],
    [changes.workspacePackages, 'Workspace package.json', wp => `  ~ ${wp.path}`],
    [changes.newWorkspaces, 'New workspaces', w => `  + ${w}`],
  ];

  for (const [items, label, fmt] of sections) {
    if (items?.length > 0) {
      lines.push(`${label} (${items.length}):`);
      items.forEach(item => lines.push(fmt(item)));
      lines.push('');
    }
  }

  if (changes.packageJson) {
    lines.push('package.json: dependencies/scripts will be merged');
    lines.push('');
  }

  return lines.join('\n');
}
