import fs from 'fs';
import path from 'path';
import https from 'https';

const EXTENSIONS_URL = 'https://raw.githubusercontent.com/scaffold-eth/create-eth/main/src/extensions/create-eth-extensions.ts';

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

  // Tertiary check: yarn workspaces with @se-2 pattern
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
  const packageJsonPath = path.join(cwd, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const installedExtensions = packageJson.scaffoldEth?.extensions || [];
    return installedExtensions.includes(extensionName);
  } catch (error) {
    console.error('Error reading package.json:', error.message);
    return false;
  }
}

/**
 * Fetches extensions list from create-eth repo
 * @returns {Promise<string[]>} - Array of extension names
 */
async function fetchExtensionsList() {
  return new Promise((resolve, reject) => {
    https.get(EXTENSIONS_URL, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          // Parse TypeScript file to extract extensionFlagValue fields
          const matches = data.matchAll(/extensionFlagValue:\s*["']([^"']+)["']/g);
          const extensions = Array.from(matches, m => m[1]);

          if (extensions.length === 0) {
            // Fallback to hardcoded list if parsing fails
            const fallback = [
              'subgraph', 'x402', 'eip-712', 'ponder', 'erc-20',
              'eip-5792', 'randao', 'erc-721', 'porto', 'envio', 'drizzle-neon'
            ];
            console.warn('Failed to parse extensions list, using fallback');
            resolve(fallback);
            return;
          }

          resolve(extensions);
        } catch (error) {
          reject(new Error(`Failed to parse extensions list: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      // Fallback to hardcoded list on network error
      const fallback = [
        'subgraph', 'x402', 'eip-712', 'ponder', 'erc-20',
        'eip-5792', 'randao', 'erc-721', 'porto', 'envio', 'drizzle-neon'
      ];
      console.warn(`Failed to fetch extensions list: ${error.message}, using fallback`);
      resolve(fallback);
    });
  });
}

/**
 * Validates extension name against known extensions
 * @param {string} extensionName - Extension to validate
 * @returns {Promise<{ valid: boolean, reason?: string, extensions?: string[] }>}
 */
export async function validateExtensionName(extensionName) {
  if (!extensionName || typeof extensionName !== 'string') {
    return { valid: false, reason: 'Extension name is required' };
  }

  const knownExtensions = await fetchExtensionsList();

  if (!knownExtensions.includes(extensionName)) {
    return {
      valid: false,
      reason: `Unknown extension "${extensionName}". Known: ${knownExtensions.join(', ')}`,
      extensions: knownExtensions
    };
  }

  return { valid: true, extensions: knownExtensions };
}
