import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { REPO_URL } from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '..', '.tmp');

/**
 * Fetches extension files from GitHub or local path
 * @param {string} extensionName - Name of extension (branch name)
 * @param {object} options - Fetch options
 * @param {string} [options.local] - Local path to extension
 * @param {string} [options.branch] - Override branch name
 * @returns {Promise<{ path: string, files: string[], cleanup: Function }>}
 */
export async function fetchExtension(extensionName, options = {}) {
  if (options.local) {
    return fetchLocalExtension(options.local);
  }

  return fetchGitHubExtension(extensionName, options.branch || extensionName);
}

/**
 * Fetches extension from GitHub branch
 * @param {string} extensionName - Extension name for display
 * @param {string} branchName - Git branch to clone
 * @returns {Promise<{ path: string, files: string[], cleanup: Function }>}
 */
async function fetchGitHubExtension(extensionName, branchName) {
  const targetDir = path.join(TEMP_DIR, `${extensionName}-${Date.now()}`);

  console.log(`Fetching ${extensionName} from GitHub (branch: ${branchName})...`);

  try {
    // Use spawnSync with array args to prevent command injection
    const result = spawnSync('git', [
      'clone',
      '--depth', '1',
      '--single-branch',
      '--branch', branchName,
      REPO_URL,
      targetDir
    ], { stdio: 'pipe' });

    if (result.status !== 0) {
      const stderr = result.stderr?.toString() || 'Unknown error';
      throw new Error(stderr);
    }

    const extensionPath = path.join(targetDir, 'extension');

    if (!fs.existsSync(extensionPath)) {
      throw new Error(`Extension directory not found in branch ${branchName}`);
    }

    const files = getExtensionFiles(extensionPath);

    return {
      path: extensionPath,
      files,
      cleanup: () => cleanupTemp(targetDir)
    };
  } catch (error) {
    // Cleanup on error
    cleanupTemp(targetDir);
    throw new Error(`Failed to fetch extension: ${error.message}`);
  }
}

/**
 * Uses local extension path (for development)
 * @param {string} localPath - Path to local extension
 * @returns {{ path: string, files: string[], cleanup: Function }}
 */
function fetchLocalExtension(localPath) {
  const extensionPath = path.resolve(localPath);

  if (!fs.existsSync(extensionPath)) {
    throw new Error(`Local path not found: ${extensionPath}`);
  }

  // For local, expect either direct extension/ dir or repo root
  const hasExtensionDir = fs.existsSync(path.join(extensionPath, 'extension'));
  const finalPath = hasExtensionDir ? path.join(extensionPath, 'extension') : extensionPath;

  const files = getExtensionFiles(finalPath);

  return {
    path: finalPath,
    files,
    cleanup: () => {} // No cleanup for local paths
  };
}

/**
 * Recursively gets all files in extension directory
 * @param {string} dir - Directory to scan
 * @param {string} [baseDir] - Base directory for relative paths
 * @returns {string[]} - Array of relative file paths
 */
function getExtensionFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    // Skip node_modules
    if (entry.name === 'node_modules') {
      continue;
    }

    // Skip dotfiles except .template.mjs and .args.mjs
    if (entry.name.startsWith('.')) {
      const isTemplateFile = entry.name.endsWith('.template.mjs') || entry.name.endsWith('.args.mjs');
      if (!isTemplateFile) {
        continue;
      }
    }

    if (entry.isDirectory()) {
      files.push(...getExtensionFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Cleans up temporary directory
 * @param {string} dir - Directory to remove
 */
export function cleanupTemp(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (error) {
    console.warn(`Failed to cleanup temp directory: ${error.message}`);
  }
}

/**
 * Cleans up all temp extension directories
 */
export function cleanupAllTemp() {
  cleanupTemp(TEMP_DIR);
}
