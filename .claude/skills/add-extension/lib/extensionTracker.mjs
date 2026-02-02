import fs from 'fs';
import path from 'path';
import { spawnSync, execSync } from 'child_process';
import { inferTemplatePath, loadArgsFile, getMergeType } from './templateUtils.mjs';
import { CREATE_ETH_REPO } from './constants.mjs';

/**
 * Tracks installed extensions and merges their args for templates
 */

/**
 * Gets list of installed extensions from scaffold.extensions.json
 * @param {string} projectPath - Project root path
 * @returns {string[]} - Array of extension names
 */
export function getInstalledExtensions(projectPath) {
  const extPath = path.join(projectPath, 'scaffold.extensions.json');
  if (!fs.existsSync(extPath)) {
    return [];
  }

  try {
    const data = JSON.parse(fs.readFileSync(extPath, 'utf8'));
    return data.extensions || [];
  } catch {
    return [];
  }
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

  const currentBranch = spawnSync('git', ['branch', '--show-current'], {
    cwd: extensionsRepoPath,
    encoding: 'utf8'
  }).stdout.trim();

  // Load args from each installed extension
  for (const extName of extensions) {
    try {
      // Switch to extension branch (use spawnSync to prevent injection)
      const checkoutResult = spawnSync('git', ['checkout', extName], {
        cwd: extensionsRepoPath,
        stdio: 'ignore'
      });

      if (checkoutResult.status !== 0) {
        console.warn(`  ⚠ Failed to checkout ${extName}`);
        continue;
      }

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
  spawnSync('git', ['checkout', currentBranch], {
    cwd: extensionsRepoPath,
    stdio: 'ignore'
  });

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

      const mergeType = getMergeType(templateDefaults[key]);

      if (mergeType === 'string') {
        merged[key] = (merged[key] || '') + (merged[key] ? '\n' : '') + value;
      } else if (mergeType === 'array') {
        if (!merged[key]) merged[key] = [];
        if (Array.isArray(value)) merged[key].push(...value);
      } else if (mergeType === 'object') {
        merged[key] = { ...(merged[key] || {}), ...value };
      } else {
        // Unknown type: last one wins
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
  // Normalize path separators for cross-platform compatibility
  const normalized = targetFilePath.replace(/\\/g, '/');
  const packagesIndex = normalized.lastIndexOf('/packages/');
  if (packagesIndex !== -1) {
    return normalized.substring(packagesIndex + 1);
  }

  const fileName = path.basename(targetFilePath);
  if (fileName === 'README.md' || fileName === '.gitignore') {
    return fileName;
  }

  return null;
}

/**
 * Gets template defaults to determine arg types for merging
 * @param {string} targetFilePath - Target file path
 * @returns {Promise<object>} - Default values from template
 */
export async function getTemplateDefaults(targetFilePath) {
  try {
    const templatePath = inferTemplatePath(targetFilePath);
    if (!templatePath) {
      return {};
    }

    const url = `${CREATE_ETH_REPO}/${templatePath}`;

    const templateContent = execSync(`curl -sL "${url}"`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });

    if (templateContent.includes('404: Not Found') || templateContent.trim().startsWith('<!DOCTYPE')) {
      return {};
    }

    // Parse the expectedArgsDefaults from withDefaults call
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
