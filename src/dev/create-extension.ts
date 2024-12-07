import arg from "arg";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { execa } from "execa";
import ncp from "ncp";
import { fileURLToPath } from "url";
import { BASE_DIR, SOLIDITY_FRAMEWORKS, SOLIDITY_FRAMEWORKS_DIR } from "../utils/consts";
import chalk from "chalk";

const EXTERNAL_EXTENSIONS_DIR = "externalExtensions";
const TARGET_EXTENSION_DIR = "extension";
const TEMPLATE_FILE_SUFFIX = ".template.mjs";
const DEPLOYED_CONTRACTS_FILE = "deployedContracts.ts";
const YARN_LOCK_FILE = "yarn.lock";
const PACKAGE_JSON_FILE = "package.json";
const NEXTJS_DIR = "nextjs";

const prettyLog = {
  info: (message: string, indent = 0) => console.log(chalk.cyan(`${"  ".repeat(indent)}${message}`)),
  success: (message: string, indent = 0) => console.log(chalk.green(`${"  ".repeat(indent)}✔︎ ${message}`)),
  warning: (message: string, indent = 0) => console.log(chalk.yellow(`${"  ".repeat(indent)}⚠ ${message}`)),
  error: (message: string, indent = 0) => console.log(chalk.red(`${"  ".repeat(indent)}✖ ${message}`)),
};

const ncpPromise = promisify(ncp);

const currentFileUrl = import.meta.url;
const templateDirectory = path.resolve(decodeURI(fileURLToPath(currentFileUrl)), "../../../templates");

const getProjectPath = (rawArgs: string[]) => {
  const args = arg({}, { argv: rawArgs.slice(2) });
  const projectPath = args._[0];
  if (!projectPath) {
    throw new Error("Project path is required");
  }
  return { projectPath };
};

const getDeletedFiles = async (projectPath: string): Promise<string[]> => {
  const { stdout: allFiles } = await execa(
    "git",
    ["log", "--all", "--diff-filter=ACDMRT", "--name-only", "--format="],
    { cwd: projectPath },
  );

  const { stdout: currentFiles } = await execa("git", ["ls-files"], {
    cwd: projectPath,
  });

  const allFilesSet = new Set(allFiles.split("\n").filter(Boolean));
  const currentFilesArray = currentFiles.split("\n").filter(Boolean);

  return Array.from(allFilesSet).filter(file => !currentFilesArray.includes(file));
};

const getChangedFilesSinceFirstCommit = async (projectPath: string): Promise<string[]> => {
  const { stdout: firstCommit } = await execa("git", ["rev-list", "--max-parents=0", "HEAD"], {
    cwd: projectPath,
  });

  const { stdout } = await execa("git", ["diff", "--diff-filter=d", "--name-only", `${firstCommit.trim()}..HEAD`], {
    cwd: projectPath,
  });

  return stdout.split("\n").filter(Boolean);
};

const createDirectories = async (filePath: string, projectName: string) => {
  const dirPath = path.join(EXTERNAL_EXTENSIONS_DIR, projectName, TARGET_EXTENSION_DIR, path.dirname(filePath));
  await fs.promises.mkdir(dirPath, { recursive: true });
};

const findTemplateFiles = async (dir: string, templates: Set<string>) => {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      await findTemplateFiles(fullPath, templates);
    } else if (file.name.endsWith(TEMPLATE_FILE_SUFFIX)) {
      let relativePath = path.relative(templateDirectory, fullPath).replace(new RegExp(`${TEMPLATE_FILE_SUFFIX}$`), "");
      const pathSegments = relativePath.split(path.sep);

      // Normalize the relative path by stripping the initial parts
      if (pathSegments[0] === BASE_DIR) {
        relativePath = pathSegments.slice(1).join(path.sep);
      } else if (pathSegments[0] === SOLIDITY_FRAMEWORKS_DIR) {
        const framework = pathSegments[1];
        if (Object.values(SOLIDITY_FRAMEWORKS).includes(framework as any)) {
          relativePath = pathSegments.slice(2).join(path.sep);
        }
      }

      templates.add(relativePath);
    }
  }
};

const copyChanges = async (
  changedFiles: string[],
  deletedFiles: string[],
  projectName: string,
  projectPath: string,
  templates: Set<string>,
) => {
  for (const file of deletedFiles) {
    const destPath = path.join(EXTERNAL_EXTENSIONS_DIR, projectName, TARGET_EXTENSION_DIR, file);
    if (fs.existsSync(destPath)) {
      await fs.promises.unlink(destPath);
      prettyLog.success(`Removed deleted file: ${file}`, 2);
      console.log("\n");

      // remove empty directories
      const dirPath = path.dirname(destPath);
      try {
        const remainingFiles = await fs.promises.readdir(dirPath);
        if (remainingFiles.length === 0) {
          await fs.promises.rmdir(dirPath);
          prettyLog.success(`Removed empty directory: ${path.relative(EXTERNAL_EXTENSIONS_DIR, dirPath)}`, 2);
          console.log("\n");
        }
      } catch {
        // directory might already be deleted, ignore error
      }
    }
  }

  for (const file of changedFiles) {
    const pathSegmentsOfFile = file.split(path.sep);
    const sourcePath = path.resolve(projectPath, file);
    const destPath = path.join(EXTERNAL_EXTENSIONS_DIR, projectName, TARGET_EXTENSION_DIR, file);
    const sourceFileName = path.basename(sourcePath);

    if (!fs.existsSync(sourcePath)) {
      prettyLog.warning(`Source file not found, skipping: ${file}`, 2);
      console.log("\n");
      continue;
    }

    if (templates.has(file)) {
      prettyLog.warning(`Skipping file: ${file}`, 2);
      prettyLog.info(`Please instead create/update: ${destPath}.args.mjs`, 3);
      console.log("\n");
      continue;
    }

    if (sourceFileName === DEPLOYED_CONTRACTS_FILE) {
      prettyLog.warning(`Skipping file: ${file}`, 2);
      prettyLog.info(`${sourceFileName} can be generated using \`yarn deploy\``, 3);
      console.log("\n");
      continue;
    }

    if (sourceFileName === YARN_LOCK_FILE) {
      prettyLog.warning(`Skipping file: ${file}`, 2);
      prettyLog.info(`${file} will be generated when doing \`yarn install\``, 3);
      console.log("\n");
      continue;
    }

    const isRootPackageJson = pathSegmentsOfFile.length === 1 && pathSegmentsOfFile[0] === PACKAGE_JSON_FILE;
    const isNextJsPackageJson =
      pathSegmentsOfFile.includes(NEXTJS_DIR) && pathSegmentsOfFile.includes(PACKAGE_JSON_FILE);
    const isSolidityFrameworkPackageJson =
      (pathSegmentsOfFile.includes(SOLIDITY_FRAMEWORKS.HARDHAT) ||
        pathSegmentsOfFile.includes(SOLIDITY_FRAMEWORKS.FOUNDRY)) &&
      pathSegmentsOfFile.includes(PACKAGE_JSON_FILE);

    if (isRootPackageJson || isNextJsPackageJson || isSolidityFrameworkPackageJson) {
      prettyLog.warning(`Skipping file: ${file}`, 2);
      prettyLog.info(`Please manually just add new scripts or dependencies in: ${destPath}`, 3);
      console.log("\n");
      continue;
    }

    const coreFilesPath = [
      path.join(templateDirectory, BASE_DIR, file),
      path.join(templateDirectory, SOLIDITY_FRAMEWORKS_DIR, SOLIDITY_FRAMEWORKS.HARDHAT, file),
      path.join(templateDirectory, SOLIDITY_FRAMEWORKS_DIR, SOLIDITY_FRAMEWORKS.FOUNDRY, file),
    ];
    if (coreFilesPath.some(fs.existsSync)) {
      prettyLog.error(`Ignored file: ${file}`, 2);
      prettyLog.info("Only new files can be added", 3);
      console.log("\n");
      continue;
    }

    await createDirectories(file, projectName);
    await ncpPromise(sourcePath, destPath);
    prettyLog.success(`Copied: ${file}`, 2);
    console.log("\n");
  }
};

const main = async (rawArgs: string[]) => {
  try {
    const { projectPath } = getProjectPath(rawArgs);
    const projectName = path.basename(projectPath);
    const templates = new Set<string>();
    await findTemplateFiles(templateDirectory, templates);

    console.log("\n");
    prettyLog.info(`Extension name: ${projectName}\n`);

    prettyLog.info("Getting list of changed files...", 1);
    const changedFiles = await getChangedFilesSinceFirstCommit(projectPath);
    const deletedFiles = await getDeletedFiles(projectPath);

    if (changedFiles.length === 0 && deletedFiles.length === 0) {
      prettyLog.warning("There are no file changes to copy.", 1);
      console.log("\n");
    } else {
      prettyLog.info(`Found ${changedFiles.length} changed files, processing them...`, 1);
      console.log("\n");
      await copyChanges(changedFiles, deletedFiles, projectName, projectPath, templates);
    }

    prettyLog.info(`Files processed successfully, updated ${EXTERNAL_EXTENSIONS_DIR}/${projectName} directory.`);
  } catch (err: any) {
    prettyLog.error(`Error: ${err.message}`);
  }
};

main(process.argv).catch(() => process.exit(1));
