import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * Tracks installed extensions and merges their args for templates
 */

/**
 * Gets list of installed extensions from package.json
 * @param {string} projectPath - Project root path
 * @returns {string[]} - Array of extension names
 */
export function getInstalledExtensions(projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return [];
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.scaffoldEth?.extensions || [];
}

/**
 * Loads args from all installed extensions for a specific file
 * @param {string[]} extensions - Array of extension names
 * @param {string} targetFilePath - Target file (e.g., Header.tsx)
 * @param {string} extensionsRepoPath - Path to create-eth-extensions repo
 * @returns {Promise<object>} - Merged args from all extensions
 */
export async function loadMergedArgs(extensions, targetFilePath, extensionsRepoPath) {
  const allArgs = [];

  // Determine the args file path based on target file
  const relativePath = getRelativePathForArgs(targetFilePath);
  if (!relativePath) {
    return {};
  }

  const { execSync } = await import('child_process');
  const currentBranch = execSync('git branch --show-current', {
    cwd: extensionsRepoPath,
    encoding: 'utf8'
  }).trim();

  // Load args from each installed extension
  for (const extName of extensions) {
    try {
      // Switch to extension branch
      execSync(`git checkout ${extName}`, {
        cwd: extensionsRepoPath,
        stdio: 'ignore'
      });

      const argsPath = path.join(
        extensionsRepoPath,
        'extension',
        relativePath + '.args.mjs'
      );

      // Check if this extension has args for this file
      if (!fs.existsSync(argsPath)) {
        continue;
      }

      // Force reload from different branch by adding timestamp
      const args = await loadArgsFile(argsPath, Date.now());
      if (args) {
        allArgs.push({ extension: extName, args });
      }
    } catch (error) {
      console.warn(`  ⚠ Failed to load args from ${extName}: ${error.message}`);
    }
  }

  // Restore original branch
  try {
    execSync(`git checkout ${currentBranch}`, {
      cwd: extensionsRepoPath,
      stdio: 'ignore'
    });
  } catch (error) {
    // Ignore
  }

  // Fetch template defaults to determine merge types
  const templateDefaults = await getTemplateDefaults(targetFilePath);

  // Merge all args using template defaults
  return mergeArgs(allArgs, templateDefaults);
}

/**
 * Merges args from multiple extensions based on template default types
 * @param {Array<{extension: string, args: object}>} allArgs
 * @param {object} templateDefaults - Default values from template (determines merge strategy)
 * @returns {object} - Merged args
 */
function mergeArgs(allArgs, templateDefaults = {}) {
  const merged = {};

  for (const { args } of allArgs) {
    for (const [key, value] of Object.entries(args)) {
      if (key === 'default') continue;

      // Determine merge strategy based on template default type
      const defaultValue = templateDefaults[key];
      const defaultType = Array.isArray(defaultValue) ? 'array' : typeof defaultValue;

      if (defaultType === 'string') {
        // String: concatenate
        if (!merged[key]) {
          merged[key] = '';
        }
        merged[key] += (merged[key] ? '\n' : '') + value;
      } else if (defaultType === 'array') {
        // Array: push
        if (!merged[key]) {
          merged[key] = [];
        }
        if (Array.isArray(value)) {
          merged[key].push(...value);
        }
      } else if (defaultType === 'object') {
        // Object: merge
        if (!merged[key]) {
          merged[key] = {};
        }
        merged[key] = { ...merged[key], ...value };
      } else {
        // Unknown type or no default: last one wins
        merged[key] = value;
      }
    }
  }

  return merged;
}

/**
 * Gets relative path for args file
 */
function getRelativePathForArgs(targetFilePath) {
  // Extract relative path from absolute target path
  const packagesIndex = targetFilePath.lastIndexOf('/packages/');
  if (packagesIndex !== -1) {
    return targetFilePath.substring(packagesIndex + 1);
  }

  const fileName = path.basename(targetFilePath);
  if (fileName === 'README.md' || fileName === '.gitignore') {
    return fileName;
  }

  return null;
}

/**
 * Loads args from a .args.mjs file
 * @param {string} argsFilePath - Path to args file
 * @param {number} cacheBuster - Timestamp to force reload
 */
async function loadArgsFile(argsFilePath, cacheBuster = 0) {
  try {
    const fileUrl = pathToFileURL(argsFilePath).href + `?v=${cacheBuster}`;
    const module = await import(fileUrl);
    return module;
  } catch (error) {
    return null;
  }
}

/**
 * Gets template defaults to determine arg types for merging
 * @param {string} targetFilePath - Target file path
 * @returns {Promise<object>} - Default values from template
 */
export async function getTemplateDefaults(targetFilePath) {
  try {
    // Infer template path
    const templatePath = inferTemplatePathForDefaults(targetFilePath);
    if (!templatePath) {
      return {};
    }

    // Fetch template from GitHub
    const { execSync } = await import('child_process');
    const CREATE_ETH_REPO = 'https://raw.githubusercontent.com/scaffold-eth/create-eth/main';
    const url = `${CREATE_ETH_REPO}/${templatePath}`;

    const templateContent = execSync(`curl -sL "${url}"`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });

    if (templateContent.includes('404: Not Found') || templateContent.trim().startsWith('<!DOCTYPE')) {
      return {};
    }

    // Parse the expectedArgsDefaults from withDefaults call
    // Match: withDefaults(contents, { key: value, ... })
    const match = templateContent.match(/withDefaults\s*\([^,]+,\s*(\{[\s\S]*?\})\s*\)/);
    if (!match) {
      return {};
    }

    // Use Function constructor to evaluate the defaults object
    // This is safe because we're fetching from the official scaffold-eth repo
    const defaultsStr = match[1];
    const defaults = new Function(`return ${defaultsStr}`)();

    return defaults;
  } catch (error) {
    return {};
  }
}

/**
 * Infers template path from target file path (for fetching defaults)
 */
function inferTemplatePathForDefaults(targetFilePath) {
  let relativePath = targetFilePath;

  const packagesIndex = relativePath.lastIndexOf('/packages/');
  if (packagesIndex !== -1) {
    relativePath = relativePath.substring(packagesIndex + 1);
  } else {
    const fileName = path.basename(relativePath);
    if (fileName === 'README.md' || fileName === '.gitignore') {
      relativePath = fileName;
    } else {
      return null;
    }
  }

  relativePath = relativePath.replace(/\\/g, '/');

  if (relativePath.startsWith('packages/')) {
    return `templates/base/${relativePath}.template.mjs`;
  }

  if (relativePath === 'README.md' || relativePath === '.gitignore') {
    return `templates/base/${relativePath}.template.mjs`;
  }

  return null;
}
