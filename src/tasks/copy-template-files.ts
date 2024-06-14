import { execa } from "execa";
import { Options, TemplateDescriptor } from "../types";
import { baseDir } from "../utils/consts";
import { extensionDict } from "../utils/extensions-dictionary";
import { findFilesRecursiveSync } from "../utils/find-files-recursively";
import { mergePackageJson } from "../utils/merge-package-json";
import fs from "fs";
import url from "url";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
import link from "../utils/link";
import { getArgumentFromExternalExtensionOption } from "../utils/external-extensions";

const EXTERNAL_EXTENSION_TMP_FOLDER = "tmp-external-extension";
const copy = promisify(ncp);
let copyOrLink = copy;

const isTemplateRegex = /([^/\\]*?)\.template\./;
const isPackageJsonRegex = /package\.json/;
const isYarnLockRegex = /yarn\.lock/;
const isConfigRegex = /([^/\\]*?)\\config\.json/;
const isArgsRegex = /([^/\\]*?)\.args\./;
const isExtensionFolderRegex = /extensions$/;
const isPackagesFolderRegex = /packages$/;
const isDeployedContractsRegex = /packages\/nextjs\/contracts\/deployedContracts\.ts/;

const copyBaseFiles = async (basePath: string, targetDir: string, { dev: isDev }: Options) => {
  await copyOrLink(basePath, targetDir, {
    clobber: false,
    filter: fileName => {
      const isTemplate = isTemplateRegex.test(fileName);

      const isYarnLock = isYarnLockRegex.test(fileName);
      const isDeployedContracts = isDeployedContractsRegex.test(fileName);
      const skipDevOnly = isDev && (isYarnLock || isDeployedContracts);

      return !isTemplate && !skipDevOnly;
    },
  });

  if (isDev) {
    // we don't want to symlink yarn.lock & deployedContracts.ts file
    const baseYarnLockPaths = findFilesRecursiveSync(basePath, path => isYarnLockRegex.test(path));
    baseYarnLockPaths.forEach(yarnLockPath => {
      const partialPath = yarnLockPath.split(basePath)[1];
      void copy(path.join(basePath, partialPath), path.join(targetDir, partialPath));
    });

    const baseDeployedContractsPaths = findFilesRecursiveSync(basePath, path => isDeployedContractsRegex.test(path));
    baseDeployedContractsPaths.forEach(deployedContractsPath => {
      const partialPath = deployedContractsPath.split(basePath)[1];
      void copy(path.join(basePath, partialPath), path.join(targetDir, partialPath));
    });
  }
};

const copyExtensionsFiles = async ({ dev: isDev }: Options, extensionPath: string, targetDir: string) => {
  // copy (or link if dev) root files
  await copyOrLink(extensionPath, path.join(targetDir), {
    clobber: false,
    filter: path => {
      const isConfig = isConfigRegex.test(path);
      const isArgs = isArgsRegex.test(path);
      const isExtensionFolder = isExtensionFolderRegex.test(path) && fs.lstatSync(path).isDirectory();
      const isPackagesFolder = isPackagesFolderRegex.test(path) && fs.lstatSync(path).isDirectory();
      const isTemplate = isTemplateRegex.test(path);
      // PR NOTE: this wasn't needed before because ncp had the clobber: false
      const isPackageJson = isPackageJsonRegex.test(path);
      const shouldSkip = isConfig || isArgs || isTemplate || isPackageJson || isExtensionFolder || isPackagesFolder;
      return !shouldSkip;
    },
  });

  // merge root package.json
  mergePackageJson(path.join(targetDir, "package.json"), path.join(extensionPath, "package.json"), isDev);

  const extensionPackagesPath = path.join(extensionPath, "packages");
  const hasPackages = fs.existsSync(extensionPackagesPath);
  if (hasPackages) {
    // copy extension packages files
    await copyOrLink(extensionPackagesPath, path.join(targetDir, "packages"), {
      clobber: false,
      filter: path => {
        const isArgs = isArgsRegex.test(path);
        const isTemplate = isTemplateRegex.test(path);
        const isPackageJson = isPackageJsonRegex.test(path);
        const shouldSkip = isArgs || isTemplate || isPackageJson;

        return !shouldSkip;
      },
    });

    // copy each package's package.json
    const extensionPackages = fs.readdirSync(extensionPackagesPath);
    extensionPackages.forEach(packageName => {
      mergePackageJson(
        path.join(targetDir, "packages", packageName, "package.json"),
        path.join(extensionPath, "packages", packageName, "package.json"),
        isDev,
      );
    });
  }
};

const processTemplatedFiles = async (
  { extensions, externalExtension, dev: isDev }: Options,
  basePath: string,
  targetDir: string,
) => {
  const baseTemplatedFileDescriptors: TemplateDescriptor[] = findFilesRecursiveSync(basePath, path =>
    isTemplateRegex.test(path),
  ).map(baseTemplatePath => ({
    path: baseTemplatePath,
    fileUrl: url.pathToFileURL(baseTemplatePath).href,
    relativePath: baseTemplatePath.split(basePath)[1],
    source: "base",
  }));

  const extensionsTemplatedFileDescriptors: TemplateDescriptor[] = extensions
    .map(ext =>
      findFilesRecursiveSync(extensionDict[ext].path, filePath => isTemplateRegex.test(filePath)).map(
        extensionTemplatePath => ({
          path: extensionTemplatePath,
          fileUrl: url.pathToFileURL(extensionTemplatePath).href,
          relativePath: extensionTemplatePath.split(extensionDict[ext].path)[1],
          source: `extension ${extensionDict[ext].name}`,
        }),
      ),
    )
    .flat();

  const externalExtensionTemplatedFileDescriptors: TemplateDescriptor[] = externalExtension
    ? findFilesRecursiveSync(path.join(targetDir, EXTERNAL_EXTENSION_TMP_FOLDER, "extension"), filePath =>
        isTemplateRegex.test(filePath),
      ).map(extensionTemplatePath => ({
        path: extensionTemplatePath,
        fileUrl: url.pathToFileURL(extensionTemplatePath).href,
        relativePath: extensionTemplatePath.split(path.join(targetDir, EXTERNAL_EXTENSION_TMP_FOLDER, "extension"))[1],
        source: `external extension ${getArgumentFromExternalExtensionOption(externalExtension)}`,
      }))
    : [];

  await Promise.all(
    [
      ...baseTemplatedFileDescriptors,
      ...extensionsTemplatedFileDescriptors,
      ...externalExtensionTemplatedFileDescriptors,
    ].map(async templateFileDescriptor => {
      const templateTargetName = templateFileDescriptor.path.match(isTemplateRegex)?.[1] as string;

      const argsPath = templateFileDescriptor.relativePath.replace(isTemplateRegex, `${templateTargetName}.args.`);

      const argsFileUrls = extensions
        .map(extension => {
          const argsFilePath = path.join(extensionDict[extension].path, argsPath);
          const fileExists = fs.existsSync(argsFilePath);
          if (!fileExists) {
            return [];
          }
          return url.pathToFileURL(argsFilePath).href;
        })
        .flat();

      if (externalExtension) {
        const argsFilePath = path.join(targetDir, EXTERNAL_EXTENSION_TMP_FOLDER, "extension", argsPath);

        const fileExists = fs.existsSync(argsFilePath);
        if (fileExists) {
          argsFileUrls?.push(url.pathToFileURL(argsFilePath).href);
        }
      }

      const args = await Promise.all(
        argsFileUrls.map(async argsFileUrl => (await import(argsFileUrl)) as Record<string, any>),
      );

      const fileTemplate = (await import(templateFileDescriptor.fileUrl)).default as (
        args: Record<string, string[]>,
      ) => string;

      if (!fileTemplate) {
        throw new Error(
          `Template ${templateTargetName} from ${templateFileDescriptor.source} doesn't have a default export`,
        );
      }
      if (typeof fileTemplate !== "function") {
        throw new Error(
          `Template ${templateTargetName} from ${templateFileDescriptor.source} is not exporting a function by default`,
        );
      }

      const allKeys = [...new Set(args.flatMap(Object.keys))];

      const freshArgs: { [key: string]: string[] } = Object.fromEntries(
        allKeys.map(key => [
          key, // INFO: key for the freshArgs object
          [], // INFO: initial value for the freshArgs object
        ]),
      );

      const combinedArgs = args.reduce<typeof freshArgs>((accumulated, arg) => {
        Object.entries(arg).map(([key, value]) => {
          accumulated[key]?.push(value);
        });
        return accumulated;
      }, freshArgs);

      const output = fileTemplate(combinedArgs);

      const targetPath = path.join(
        targetDir,
        templateFileDescriptor.relativePath.split(templateTargetName)[0],
        templateTargetName,
      );
      fs.writeFileSync(targetPath, output);

      if (isDev) {
        const hasCombinedArgs = Object.keys(combinedArgs).length > 0;
        const hasArgsPaths = argsFileUrls.length > 0;
        const devOutput = `--- TEMPLATE FILE
templates/${templateFileDescriptor.source}${templateFileDescriptor.relativePath}


--- ARGS FILES
${
  hasArgsPaths
    ? argsFileUrls.map(url => `\t- ${path.join("templates", url.split("templates")[1])}`).join("\n")
    : "(no args files writing to the template)"
}


--- RESULTING ARGS
${
  hasCombinedArgs
    ? Object.entries(combinedArgs)
        .map(([argName, argValue]) => `\t- ${argName}:\t[${argValue.join(",")}]`)
        // TODO improvement: figure out how to add the values added by each args file
        .join("\n")
    : "(no args sent for the template)"
}
`;
        fs.writeFileSync(`${targetPath}.dev`, devOutput);
      }
    }),
  );
};

const setUpExternalExtensionFiles = async (options: Options, tmpDir: string) => {
  // 1. Create tmp directory to clone external extension
  await fs.promises.mkdir(tmpDir);

  const repository = options.externalExtension!.repository;
  const branch = options.externalExtension!.branch;

  // 2. Clone external extension
  if (branch) {
    await execa("git", ["clone", "--branch", branch, repository, tmpDir], {
      cwd: tmpDir,
    });
  } else {
    await execa("git", ["clone", repository, tmpDir], { cwd: tmpDir });
  }
};

export async function copyTemplateFiles(options: Options, templateDir: string, targetDir: string) {
  copyOrLink = options.dev ? link : copy;
  const basePath = path.join(templateDir, baseDir);
  const tmpDir = path.join(targetDir, EXTERNAL_EXTENSION_TMP_FOLDER);

  // 1. Copy base template to target directory
  await copyBaseFiles(basePath, targetDir, options);

  // 2. Copy extensions folders
  await Promise.all(
    options.extensions.map(async extension => {
      const extensionPath = extensionDict[extension].path;
      await copyExtensionsFiles(options, extensionPath, targetDir);
    }),
  );

  // 3. Set up external extension if needed
  if (options.externalExtension) {
    await setUpExternalExtensionFiles(options, tmpDir);
    await copyExtensionsFiles(options, path.join(tmpDir, "extension"), targetDir);
  }

  // 4. Process templated files and generate output
  await processTemplatedFiles(options, basePath, targetDir);

  // 5. Delete tmp directory
  if (options.externalExtension) {
    await fs.promises.rm(tmpDir, { recursive: true });
  }

  // 6. Initialize git repo to avoid husky error
  await execa("git", ["init"], { cwd: targetDir });
  await execa("git", ["checkout", "-b", "main"], { cwd: targetDir });
}
