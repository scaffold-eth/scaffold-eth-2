import { execSync } from 'child_process';
import { inferTemplatePath } from './templateUtils.mjs';
import { CREATE_ETH_REPO } from './constants.mjs';

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
    const curlCmd = process.platform === 'win32' ? 'curl.exe' : 'curl';

    const templateContent = execSync(`${curlCmd} -sL "${url}"`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true
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
    const defaultsStr = match[1];
    const defaults = new Function(`return ${defaultsStr}`)();

    return defaults;
  } catch (error) {
    return {};
  }
}
