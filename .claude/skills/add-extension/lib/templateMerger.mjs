import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { getInstalledExtensions, loadMergedArgs, getTemplateDefaults } from './extensionTracker.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREATE_ETH_REPO = 'https://raw.githubusercontent.com/scaffold-eth/create-eth/main';
const TEMPLATE_CACHE_DIR = path.join(__dirname, '.cache/templates');
const UTILS_PATH = path.join(__dirname, 'create-eth-utils/utils.js');

/**
 * Template-based merger using create-eth template files
 */

/**
 * Previews .args.mjs merge without applying changes
 * @param {string} argsFilePath - Path to .args.mjs file (current extension)
 * @param {string} targetFilePath - Path to target file to create/update
 * @param {string} projectPath - Project root path
 * @param {string} extensionsRepoPath - Path to create-eth-extensions repo
 * @returns {Promise<object>} - Preview object with success, exists, newContent, etc
 */
export async function previewTemplateMerge(argsFilePath, targetFilePath, projectPath, extensionsRepoPath, currentExtensionName) {
  try {
    // Get all installed extensions
    const installedExtensions = getInstalledExtensions(projectPath);

    // Load and merge args from ALL installed extensions
    const mergedArgs = await loadMergedArgs(installedExtensions, targetFilePath, extensionsRepoPath);

    // Fetch template defaults first
    const templateDefaults = await getTemplateDefaults(targetFilePath);

    // Add current extension's args ONLY if not already in installed list
    if (!installedExtensions.includes(currentExtensionName)) {
      const currentArgs = await loadArgsFile(argsFilePath);
      if (currentArgs) {
        // Merge current args on top using template defaults
        for (const [key, value] of Object.entries(currentArgs)) {
          if (key === 'default') continue;

          const defaultValue = templateDefaults[key];
          const defaultType = Array.isArray(defaultValue) ? 'array' : typeof defaultValue;

          if (defaultType === 'string') {
            mergedArgs[key] = (mergedArgs[key] || '') + (mergedArgs[key] ? '\n' : '') + value;
          } else if (defaultType === 'array') {
            if (!mergedArgs[key]) mergedArgs[key] = [];
            if (Array.isArray(value)) mergedArgs[key].push(...value);
          } else if (defaultType === 'object') {
            if (!mergedArgs[key]) mergedArgs[key] = {};
            mergedArgs[key] = { ...mergedArgs[key], ...value };
          } else {
            mergedArgs[key] = value;
          }
        }
      }
    }

    if (Object.keys(mergedArgs).length === 0) {
      return { success: false, reason: 'No args to merge' };
    }

    // Determine template path
    const templatePath = inferTemplatePath(targetFilePath);
    if (!templatePath) {
      return { success: false, reason: 'Could not infer template path' };
    }

    // Fetch template
    const template = await fetchTemplate(templatePath);
    if (!template) {
      return { success: false, reason: 'Template not found' };
    }

    // Generate content
    const generatedContent = await executeTemplate(template, mergedArgs);
    if (!generatedContent) {
      return { success: false, reason: 'Failed to generate content' };
    }

    // Check if file exists
    const exists = fs.existsSync(targetFilePath);
    const existingContent = exists ? fs.readFileSync(targetFilePath, 'utf8') : null;

    // Build preview
    const preview = {
      success: true,
      exists,
      newLines: generatedContent.split('\n').length,
      newContent: generatedContent
    };

    if (exists) {
      preview.existingLines = existingContent.split('\n').length;
      preview.existingContent = existingContent;
      // Generate simple diff preview (first 10 lines)
      preview.diff = generateSimpleDiff(existingContent, generatedContent);
    } else {
      // Show first 10 lines of new content
      preview.preview = generatedContent.split('\n').slice(0, 10).join('\n');
    }

    return preview;
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Applies .args.mjs merge using create-eth template
 * @param {string} argsFilePath - Path to .args.mjs file (current extension)
 * @param {string} targetFilePath - Path to target file to create/update
 * @param {string} projectPath - Project root path
 * @param {string} extensionsRepoPath - Path to create-eth-extensions repo
 * @returns {Promise<boolean>} - true if changes were applied
 */
export async function applyTemplateMerge(argsFilePath, targetFilePath, projectPath, extensionsRepoPath, currentExtensionName) {
  try {
    // Get all installed extensions
    const installedExtensions = getInstalledExtensions(projectPath);

    // Load and merge args from ALL installed extensions
    const mergedArgs = await loadMergedArgs(installedExtensions, targetFilePath, extensionsRepoPath);

    // Fetch template defaults first
    const templateDefaults = await getTemplateDefaults(targetFilePath);

    // Add current extension's args ONLY if not already in installed list
    if (!installedExtensions.includes(currentExtensionName)) {
      const currentArgs = await loadArgsFile(argsFilePath);
      if (currentArgs) {
        // Merge current args on top using template defaults
        for (const [key, value] of Object.entries(currentArgs)) {
          if (key === 'default') continue;

          const defaultValue = templateDefaults[key];
          const defaultType = Array.isArray(defaultValue) ? 'array' : typeof defaultValue;

          if (defaultType === 'string') {
            mergedArgs[key] = (mergedArgs[key] || '') + (mergedArgs[key] ? '\n' : '') + value;
          } else if (defaultType === 'array') {
            if (!mergedArgs[key]) mergedArgs[key] = [];
            if (Array.isArray(value)) mergedArgs[key].push(...value);
          } else if (defaultType === 'object') {
            if (!mergedArgs[key]) mergedArgs[key] = {};
            mergedArgs[key] = { ...mergedArgs[key], ...value };
          } else {
            mergedArgs[key] = value;
          }
        }
      }
    }

    if (Object.keys(mergedArgs).length === 0) {
      console.log('  [template] No args to merge');
      return false;
    }

    // Determine template path in create-eth repo
    const templatePath = inferTemplatePath(targetFilePath);
    if (!templatePath) {
      console.log('  [template] Could not infer template path');
      return false;
    }

    console.log(`  [template] Using template: ${templatePath}`);

    // Fetch template from GitHub
    const template = await fetchTemplate(templatePath);
    if (!template) {
      console.log('  [template] Template not found');
      return false;
    }

    // Generate content from template with merged args
    const generatedContent = await executeTemplate(template, mergedArgs);
    if (!generatedContent) {
      console.log('  [template] Failed to generate content');
      return false;
    }

    // Read existing file if it exists
    const existingContent = fs.existsSync(targetFilePath)
      ? fs.readFileSync(targetFilePath, 'utf8')
      : null;

    // Check if content changed
    if (existingContent === generatedContent) {
      return false;
    }

    // Write generated content
    const dir = path.dirname(targetFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetFilePath, generatedContent, 'utf8');

    return true;
  } catch (error) {
    // Silent fail - template-based merge unavailable
    return false;
  }
}

/**
 * Infers template path from target file path
 */
function inferTemplatePath(targetFilePath) {
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
 * Fetches template from GitHub
 */
async function fetchTemplate(templatePath) {
  try {
    const cachePath = path.join(TEMPLATE_CACHE_DIR, templatePath);
    if (fs.existsSync(cachePath)) {
      return fs.readFileSync(cachePath, 'utf8');
    }

    const url = `${CREATE_ETH_REPO}/${templatePath}`;
    const content = execSync(`curl -sL "${url}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

    if (content.includes('404: Not Found') || content.trim().startsWith('<!DOCTYPE')) {
      return null;
    }

    const cacheDir = path.dirname(cachePath);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(cachePath, content, 'utf8');

    return content;
  } catch (error) {
    return null;
  }
}

/**
 * Loads .args.mjs file
 */
async function loadArgsFile(argsFilePath) {
  try {
    const fileUrl = pathToFileURL(argsFilePath).href;
    const module = await import(fileUrl);
    return module;
  } catch (error) {
    return null;
  }
}

/**
 * Executes template with args to generate content
 */
async function executeTemplate(templateContent, args) {
  try {
    const tempDir = path.join(TEMPLATE_CACHE_DIR, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Rewrite imports to point to our local utils
    const rewrittenTemplate = rewriteUtilsImport(templateContent);

    const tempFile = path.join(tempDir, `template-${Date.now()}.mjs`);
    fs.writeFileSync(tempFile, rewrittenTemplate, 'utf8');

    // Import template
    const templateModule = await import(pathToFileURL(tempFile).href);

    // Clean up temp file
    fs.unlinkSync(tempFile);

    // Get contents function (or default export)
    const templateFn = templateModule.contents || templateModule.default;

    if (typeof templateFn !== 'function') {
      console.log('  [template] No contents/default function exported');
      return null;
    }

    // Convert args to template format
    const templateArgs = convertArgsToTemplateFormat(args);

    // Execute template
    const result = templateFn(templateArgs);

    console.log(`  [template] Generated ${result.length} characters`);
    return result;
  } catch (error) {
    console.log(`  [template] Execute error: ${error.message}`);
    return null;
  }
}

/**
 * Rewrites import paths to use local utils
 */
function rewriteUtilsImport(templateContent) {
  // Replace relative imports to utils.js with absolute path to our local copy
  const utilsUrl = pathToFileURL(UTILS_PATH).href;
  return templateContent.replace(
    /from\s+['"](\.\.\/)+utils\.js['"]/g,
    `from "${utilsUrl}"`
  );
}

/**
 * Converts args from .args.mjs to template format
 * Templates expect args as arrays where index 0 is the value
 * For extra*Objects patterns, the value should be an array at index 0
 */
function convertArgsToTemplateFormat(args) {
  const converted = {};

  for (const [key, value] of Object.entries(args)) {
    if (key === 'default') continue;

    // For extra*Objects, the value is already an array of objects
    // Wrap the whole array at index 0: [[{obj1}, {obj2}]]
    if (key.match(/^extra.+Objects$/i) && Array.isArray(value)) {
      converted[key] = [value];
    } else {
      // For other values, wrap in array if not already
      converted[key] = Array.isArray(value) ? value : [value];
    }
  }

  // Add global args with defaults
  if (!converted.solidityFramework) {
    converted.solidityFramework = [''];
  }
  if (!converted.logoTitle) {
    converted.logoTitle = ['Scaffold-ETH'];
  }
  if (!converted.logoSubtitle) {
    converted.logoSubtitle = ['Ethereum dev stack'];
  }

  return converted;
}

/**
 * Applies standalone .template.mjs file (without .args.mjs)
 * @param {string} templateFilePath - Path to .template.mjs file in extension
 * @param {string} targetFilePath - Path to target file to create/update
 * @param {string} projectPath - Project root path
 * @returns {Promise<boolean>} - true if changes were applied
 */
export async function applyStandaloneTemplate(templateFilePath, targetFilePath, projectPath) {
  try {
    // Read and execute the template file directly
    const templateContent = fs.readFileSync(templateFilePath, 'utf8');

    // Rewrite imports to point to our local utils
    const rewrittenTemplate = rewriteUtilsImport(templateContent);

    // Execute template
    const generatedContent = await executeStandaloneTemplate(rewrittenTemplate);
    if (!generatedContent) {
      console.log('  [template] Failed to generate content from standalone template');
      return false;
    }

    // Read existing file if it exists
    const existingContent = fs.existsSync(targetFilePath)
      ? fs.readFileSync(targetFilePath, 'utf8')
      : null;

    // Check if content changed
    if (existingContent === generatedContent) {
      return false;
    }

    // Write generated content
    const dir = path.dirname(targetFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetFilePath, generatedContent, 'utf8');

    return true;
  } catch (error) {
    console.log(`  [template] Error applying standalone template: ${error.message}`);
    return false;
  }
}

/**
 * Executes a standalone template (without args)
 */
async function executeStandaloneTemplate(templateContent) {
  try {
    const tempDir = path.join(TEMPLATE_CACHE_DIR, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `template-${Date.now()}.mjs`);
    fs.writeFileSync(tempFile, templateContent, 'utf8');

    // Import template
    const templateModule = await import(pathToFileURL(tempFile).href);

    // Clean up temp file
    fs.unlinkSync(tempFile);

    // Get contents function (or default export)
    const templateFn = templateModule.contents || templateModule.default;

    if (typeof templateFn !== 'function') {
      console.log('  [template] No contents/default function exported');
      return null;
    }

    // Execute template without args or with empty args
    const result = templateFn();

    console.log(`  [template] Generated ${result.length} characters`);
    return result;
  } catch (error) {
    console.log(`  [template] Execute error: ${error.message}`);
    return null;
  }
}

/**
 * Clears template cache
 */
export function clearTemplateCache() {
  if (fs.existsSync(TEMPLATE_CACHE_DIR)) {
    fs.rmSync(TEMPLATE_CACHE_DIR, { recursive: true, force: true });
  }
}
