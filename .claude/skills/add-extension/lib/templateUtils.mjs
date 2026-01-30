import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pathToFileURL } from 'url';

/**
 * Shared utilities for template processing
 */

/**
 * Infers template path from target file path
 * @param {string} targetFilePath - Target file path
 * @returns {string | null} - Template path or null if cannot infer
 */
export function inferTemplatePath(targetFilePath) {
  let relativePath = targetFilePath;

  // Extract relative path
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

  // Map to template location
  if (relativePath.startsWith('packages/')) {
    return `templates/base/${relativePath}.template.mjs`;
  }

  if (relativePath === 'README.md' || relativePath === '.gitignore') {
    return `templates/base/${relativePath}.template.mjs`;
  }

  return null;
}

/**
 * Generates simple diff preview
 * @param {string} oldContent - Existing content
 * @param {string} newContent - New content
 * @returns {string} - Simple diff preview
 */
export function generateSimpleDiff(oldContent, newContent) {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  const preview = [];
  const maxLines = 10;
  let lineCount = 0;

  for (let i = 0; i < Math.max(oldLines.length, newLines.length) && lineCount < maxLines; i++) {
    if (oldLines[i] !== newLines[i]) {
      if (oldLines[i] !== undefined) {
        preview.push(`- ${oldLines[i]}`);
        lineCount++;
      }
      if (newLines[i] !== undefined && lineCount < maxLines) {
        preview.push(`+ ${newLines[i]}`);
        lineCount++;
      }
    }
  }

  if (lineCount === 0) {
    return '(no significant changes in first 10 lines)';
  }

  return preview.join('\n');
}

/**
 * Loads .args.mjs file with optional cache busting
 * @param {string} argsFilePath - Path to args file
 * @param {number} [cacheBuster] - Optional timestamp to force reload
 * @returns {Promise<object | null>} - Module exports or null
 */
export async function loadArgsFile(argsFilePath, cacheBuster = 0) {
  try {
    const suffix = cacheBuster ? `?v=${cacheBuster}` : '';
    const fileUrl = pathToFileURL(argsFilePath).href + suffix;
    const module = await import(fileUrl);
    return module;
  } catch (error) {
    return null;
  }
}

/**
 * Writes file with automatic directory creation
 * @param {string} filePath - Target file path
 * @param {string} content - File content
 */
export function writeFileWithDirs(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Determines merge type based on default value
 * @param {any} defaultValue - Default value from template
 * @returns {'array' | 'object' | 'string' | 'unknown'}
 */
export function getMergeType(defaultValue) {
  if (Array.isArray(defaultValue)) return 'array';
  if (defaultValue !== null && typeof defaultValue === 'object') return 'object';
  if (typeof defaultValue === 'string') return 'string';
  return 'unknown';
}

/**
 * Generates unique temp filename
 * @param {string} prefix - Filename prefix
 * @param {string} ext - File extension
 * @returns {string} - Unique filename
 */
export function uniqueTempName(prefix, ext) {
  return `${prefix}-${crypto.randomUUID()}${ext}`;
}
