import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { getInstalledExtensions, loadMergedArgs, getTemplateDefaults } from './extensionTracker.mjs';
import {
  inferTemplatePath,
  generateSimpleDiff,
  loadArgsFile,
  writeFileWithDirs,
  getMergeType,
  uniqueTempName
} from './templateUtils.mjs';
import { CREATE_ETH_REPO } from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_CACHE_DIR = path.join(__dirname, '.cache/templates');
const UTILS_PATH = path.join(__dirname, 'create-eth-utils/utils.js');

/**
 * Template-based merger using create-eth template files
 */

/**
 * Core template merge logic (shared by preview and apply)
 * @returns {Promise<{ success: boolean, generatedContent?: string, reason?: string }>}
 */
async function processTemplateMerge(argsFilePath, targetFilePath, projectPath, extensionsRepoPath, currentExtensionName) {
  const installedExtensions = getInstalledExtensions(projectPath);
  const mergedArgs = await loadMergedArgs(installedExtensions, targetFilePath, extensionsRepoPath);
  const templateDefaults = await getTemplateDefaults(targetFilePath);

  // Add current extension's args if not already installed
  if (!installedExtensions.includes(currentExtensionName)) {
    const currentArgs = await loadArgsFile(argsFilePath);
    if (currentArgs) {
      for (const [key, value] of Object.entries(currentArgs)) {
        if (key === 'default') continue;

        const mergeType = getMergeType(templateDefaults[key]);

        if (mergeType === 'string') {
          mergedArgs[key] = (mergedArgs[key] || '') + (mergedArgs[key] ? '\n' : '') + value;
        } else if (mergeType === 'array') {
          if (!mergedArgs[key]) mergedArgs[key] = [];
          if (Array.isArray(value)) mergedArgs[key].push(...value);
        } else if (mergeType === 'object') {
          mergedArgs[key] = { ...(mergedArgs[key] || {}), ...value };
        } else {
          mergedArgs[key] = value;
        }
      }
    }
  }

  if (Object.keys(mergedArgs).length === 0) {
    return { success: false, reason: 'No args to merge' };
  }

  const templatePath = inferTemplatePath(targetFilePath);
  if (!templatePath) {
    return { success: false, reason: 'Could not infer template path' };
  }

  const template = await fetchTemplate(templatePath);
  if (!template) {
    return { success: false, reason: 'Template not found' };
  }

  const generatedContent = await executeTemplate(template, mergedArgs);
  if (!generatedContent) {
    return { success: false, reason: 'Failed to generate content' };
  }

  return { success: true, generatedContent, templatePath };
}

/**
 * Previews .args.mjs merge without applying changes
 */
export async function previewTemplateMerge(argsFilePath, targetFilePath, projectPath, extensionsRepoPath, currentExtensionName) {
  try {
    const result = await processTemplateMerge(argsFilePath, targetFilePath, projectPath, extensionsRepoPath, currentExtensionName);

    if (!result.success) {
      return result;
    }

    const { generatedContent } = result;
    const exists = fs.existsSync(targetFilePath);
    const existingContent = exists ? fs.readFileSync(targetFilePath, 'utf8') : null;

    const preview = {
      success: true,
      exists,
      newLines: generatedContent.split('\n').length,
      newContent: generatedContent
    };

    if (exists) {
      preview.existingLines = existingContent.split('\n').length;
      preview.existingContent = existingContent;
      preview.diff = generateSimpleDiff(existingContent, generatedContent);
    } else {
      preview.preview = generatedContent.split('\n').slice(0, 10).join('\n');
    }

    return preview;
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Applies .args.mjs merge using create-eth template
 */
export async function applyTemplateMerge(argsFilePath, targetFilePath, projectPath, extensionsRepoPath, currentExtensionName, options = {}) {
  try {
    const result = await processTemplateMerge(argsFilePath, targetFilePath, projectPath, extensionsRepoPath, currentExtensionName);

    if (!result.success) {
      console.log(`  [template] ${result.reason}`);
      return false;
    }

    const { generatedContent, templatePath } = result;
    console.log(`  [template] Using template: ${templatePath}`);

    const existingContent = fs.existsSync(targetFilePath)
      ? fs.readFileSync(targetFilePath, 'utf8')
      : null;

    if (existingContent === generatedContent) {
      return false;
    }

    writeFileWithDirs(targetFilePath, generatedContent);
    return true;
  } catch (error) {
    if (options.verbose) {
      console.log(`  [template] Error: ${error.message}`);
    }
    return false;
  }
}

/**
 * Fetches template from GitHub with caching
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

    // Cache the template
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
 * Executes template with optional args to generate content
 */
async function executeTemplate(templateContent, args = null) {
  try {
    const tempDir = path.join(TEMPLATE_CACHE_DIR, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const rewrittenTemplate = rewriteUtilsImport(templateContent);
    const tempFile = path.join(tempDir, uniqueTempName('template', '.mjs'));
    fs.writeFileSync(tempFile, rewrittenTemplate, 'utf8');

    const templateModule = await import(pathToFileURL(tempFile).href);
    fs.unlinkSync(tempFile);

    const templateFn = templateModule.contents || templateModule.default;

    if (typeof templateFn !== 'function') {
      console.log('  [template] No contents/default function exported');
      return null;
    }

    const result = args ? templateFn(convertArgsToTemplateFormat(args)) : templateFn();

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
  const utilsUrl = pathToFileURL(UTILS_PATH).href;
  return templateContent.replace(
    /from\s+['"](\.\.\/)+utils\.js['"]/g,
    `from "${utilsUrl}"`
  );
}

/**
 * Converts args from .args.mjs to template format
 */
function convertArgsToTemplateFormat(args) {
  const converted = {};

  for (const [key, value] of Object.entries(args)) {
    if (key === 'default') continue;

    // For extra*Objects, wrap array at index 0
    if (key.match(/^extra.+Objects$/i) && Array.isArray(value)) {
      converted[key] = [value];
    } else {
      converted[key] = Array.isArray(value) ? value : [value];
    }
  }

  // Add global args with defaults
  converted.solidityFramework = converted.solidityFramework || [''];
  converted.logoTitle = converted.logoTitle || ['Scaffold-ETH'];
  converted.logoSubtitle = converted.logoSubtitle || ['Ethereum dev stack'];

  return converted;
}

/**
 * Applies standalone .template.mjs file (without .args.mjs)
 */
export async function applyStandaloneTemplate(templateFilePath, targetFilePath, projectPath, options = {}) {
  try {
    const templateContent = fs.readFileSync(templateFilePath, 'utf8');
    const generatedContent = await executeTemplate(templateContent);

    if (!generatedContent) {
      console.log('  [template] Failed to generate content from standalone template');
      return false;
    }

    const existingContent = fs.existsSync(targetFilePath)
      ? fs.readFileSync(targetFilePath, 'utf8')
      : null;

    if (existingContent === generatedContent) {
      return false;
    }

    writeFileWithDirs(targetFilePath, generatedContent);
    return true;
  } catch (error) {
    if (options.verbose) {
      console.log(`  [template] Error: ${error.message}`);
    }
    return false;
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
