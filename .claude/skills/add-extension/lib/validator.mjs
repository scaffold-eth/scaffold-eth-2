import fs from 'fs';
import path from 'path';
import https from 'https';
import { REGISTRY_URLS, FALLBACK_EXTENSIONS, DEFAULT_EXTENSIONS_REPO } from './constants.mjs';

/**
 * Detects if current directory is a valid Scaffold-ETH-2 project
 * @param {string} cwd - Current working directory
 * @returns {{ valid: boolean, reason?: string, solidityFramework?: 'hardhat' | 'foundry' }}
 */
export function detectSE2Project(cwd) {
  // Primary check: scaffold.config.ts exists
  const scaffoldConfig = path.join(cwd, 'packages', 'nextjs', 'scaffold.config.ts');
  if (fs.existsSync(scaffoldConfig)) {
    const solidityFramework = detectSolidityFramework(cwd);
    return { valid: true, solidityFramework };
  }

  // Secondary check: packages structure
  const packagesDir = path.join(cwd, 'packages');
  const nextjsDir = path.join(packagesDir, 'nextjs');
  const hardhatDir = path.join(packagesDir, 'hardhat');
  const foundryDir = path.join(packagesDir, 'foundry');

  if (fs.existsSync(nextjsDir) && (fs.existsSync(hardhatDir) || fs.existsSync(foundryDir))) {
    const solidityFramework = fs.existsSync(hardhatDir) ? 'hardhat' : 'foundry';
    return { valid: true, solidityFramework };
  }

  // Tertiary check: yarn workspaces with packages/* pattern
  const packageJsonPath = path.join(cwd, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.workspaces?.includes('packages/*')) {
        return {
          valid: true,
          reason: 'Detected via workspace pattern',
          solidityFramework: detectSolidityFramework(cwd)
        };
      }
    } catch (error) {
      // Invalid package.json, continue
    }
  }

  return {
    valid: false,
    reason: 'Not a Scaffold-ETH-2 project. Missing scaffold.config.ts and packages structure.'
  };
}

/**
 * Detects which solidity framework (hardhat/foundry) the project uses
 * @param {string} cwd - Current working directory
 * @returns {'hardhat' | 'foundry' | undefined}
 */
function detectSolidityFramework(cwd) {
  const hardhatDir = path.join(cwd, 'packages', 'hardhat');
  const foundryDir = path.join(cwd, 'packages', 'foundry');

  if (fs.existsSync(hardhatDir)) return 'hardhat';
  if (fs.existsSync(foundryDir)) return 'foundry';
  return undefined;
}

/**
 * Checks if an extension is already installed
 * @param {string} extensionName - Extension to check
 * @param {string} cwd - Current working directory
 * @returns {boolean}
 */
export function checkExtensionInstalled(extensionName, cwd) {
  const extPath = path.join(cwd, 'scaffold.extensions.json');

  if (!fs.existsSync(extPath)) {
    return false;
  }

  try {
    const data = JSON.parse(fs.readFileSync(extPath, 'utf8'));
    const installedExtensions = data.extensions || [];
    return installedExtensions.includes(extensionName);
  } catch (error) {
    console.error('Error reading scaffold.extensions.json:', error.message);
    return false;
  }
}

/**
 * Fetches a single registry file
 * @param {string} url - Registry URL
 * @returns {Promise<Map<string, { repository: string, branch: string }>>}
 */
function fetchSingleRegistry(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const registry = new Map();

          // Match extension objects with their fields
          const objectPattern = /\{\s*extensionFlagValue:\s*["']([^"']+)["'][^}]*repository:\s*["']([^"']+)["'](?:[^}]*branch:\s*["']([^"']+)["'])?[^}]*\}/g;
          let match;

          while ((match = objectPattern.exec(data)) !== null) {
            const [, name, repository, branch] = match;
            // Default to 'main' if no branch specified
            registry.set(name, { repository, branch: branch || 'main' });
          }

          resolve(registry);
        } catch (error) {
          resolve(new Map());
        }
      });
    }).on('error', () => {
      resolve(new Map());
    });
  });
}

/**
 * Fetches extensions registry from all create-eth registry files
 * @returns {Promise<Map<string, { repository: string, branch: string }>>}
 */
async function fetchExtensionsRegistry() {
  const registries = await Promise.all(REGISTRY_URLS.map(fetchSingleRegistry));

  // Merge all registries
  const merged = new Map();
  for (const registry of registries) {
    for (const [name, config] of registry) {
      merged.set(name, config);
    }
  }

  if (merged.size === 0) {
    console.warn('Failed to parse extensions registry, using fallback');
    return buildFallbackRegistry();
  }

  return merged;
}

/**
 * Builds fallback registry from FALLBACK_EXTENSIONS
 * @returns {Map<string, { repository: string, branch: string }>}
 */
function buildFallbackRegistry() {
  const registry = new Map();

  for (const name of FALLBACK_EXTENSIONS) {
    registry.set(name, { repository: DEFAULT_EXTENSIONS_REPO, branch: name });
  }

  return registry;
}

/**
 * Gets all extensions from registry
 * @returns {Promise<Map<string, { repository: string, branch: string }>>}
 */
export async function getExtensionsRegistry() {
  return fetchExtensionsRegistry();
}

/**
 * Validates extension name and returns its config from registry
 * @param {string} extensionName - Extension to validate
 * @returns {Promise<{ valid: boolean, reason?: string, extensions?: string[], config?: { repository: string, branch: string } }>}
 */
export async function validateExtensionName(extensionName) {
  if (!extensionName || typeof extensionName !== 'string') {
    return { valid: false, reason: 'Extension name is required' };
  }

  const registry = await fetchExtensionsRegistry();
  const extensions = Array.from(registry.keys());

  if (!registry.has(extensionName)) {
    return {
      valid: false,
      reason: `Unknown extension "${extensionName}". Known: ${extensions.join(', ')}`,
      extensions
    };
  }

  return {
    valid: true,
    extensions,
    config: registry.get(extensionName)
  };
}
