import { execa } from "execa";
import { Extension, Options, TemplateDescriptor, isDefined } from "../types";
import { baseDir } from "../utils/consts";
import { extensionDict } from "../utils/extensions-tree";
import { findFilesRecursiveSync } from "../utils/find-files-recursively";
import { mergePackageJson } from "../utils/merge-package-json";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";

const copy = promisify(ncp);

const expandExtensions = (options: Options): Extension[] => {
  const expandedExtensions = options.extensions
    .map((extension) => extensionDict[extension])
    .map((extDescriptor) =>
      [extDescriptor.extends, extDescriptor.value].filter(isDefined)
    )
    .flat()
    // this reduce just removes duplications
    .reduce(
      (exts, ext) => (exts.includes(ext) ? exts : [...exts, ext]),
      [] as Extension[]
    );

  return expandedExtensions;
};

const isTemplateRegex = /([^\/\\]*?)\.template\./;
const isConfigRegex = /config.json/;
const isArgsRegex = /([^\/\\]*?)\.args\./;
const isExtensionFolderRegex = /extensions$/;
const isPackagesFolderRegex = /packages$/;
const copyExtensionsFiles = async (
  { extensions }: Options,
  targetDir: string
) => {
  await Promise.all(extensions.map(async (extension) => {
    const extensionPath = extensionDict[extension].path;
    // copy root files
    await copy(extensionPath, path.join(targetDir), {
      clobber: false,
      filter: (path) => {
        const isConfig = isConfigRegex.test(path);
        const isArgs = isArgsRegex.test(path);
        const isExtensionFolder =
          isExtensionFolderRegex.test(path) && fs.lstatSync(path).isDirectory();
        const isPackagesFolder =
          isPackagesFolderRegex.test(path) && fs.lstatSync(path).isDirectory();
        const isTemplate = isTemplateRegex.test(path);
        const shouldSkip =
          isConfig ||
          isArgs ||
          isTemplate ||
          isExtensionFolder ||
          isPackagesFolder;
        return !shouldSkip;
      },
    });

    // merge root package.json
    mergePackageJson(
      path.join(targetDir, "package.json"),
      path.join(extensionPath, "package.json")
    );

    const extensionPackagesPath = path.join(extensionPath, "packages");
    const hasPackages = fs.existsSync(extensionPackagesPath);
    if (hasPackages) {
      // copy extension packages files
      await copy(extensionPackagesPath, path.join(targetDir, "packages"), {
        clobber: false,
        filter: (path) => {
          const isArgs = isArgsRegex.test(path);
          const isTemplate = isTemplateRegex.test(path);
          const shouldSkip = isArgs || isTemplate;

          return !shouldSkip;
        },
      });

      // copy each package's package.json
      const extensionPackages = fs.readdirSync(extensionPackagesPath);
      extensionPackages.forEach((packageName) => {
        mergePackageJson(
          path.join(targetDir, "packages", packageName, "package.json"),
          path.join(extensionPath, "packages", packageName, "package.json")
        );
      });
    }
  }));
};

const processTemplatedFiles = async (
  { extensions }: Options,
  basePath: string,
  targetDir: string
) => {
  const baseTemplatedFileDescriptors: TemplateDescriptor[] =
    findFilesRecursiveSync(basePath, (path) => isTemplateRegex.test(path)).map(
      (baseTemplatePath) => ({
        path: baseTemplatePath,
        relativePath: baseTemplatePath.split(basePath)[1],
        source: "base",
      })
    );

  const extensionsTemplatedFileDescriptors: TemplateDescriptor[] = extensions
    .map((ext) =>
      findFilesRecursiveSync(extensionDict[ext].path, (filePath) =>
        isTemplateRegex.test(filePath)
      ).map((extensionTemplatePath) => ({
        path: extensionTemplatePath,
        relativePath: extensionTemplatePath.split(extensionDict[ext].path)[1],
        source: `extension ${extensionDict[ext].name}`,
      }))
    )
    .flat();

  await Promise.all(
    [
      ...baseTemplatedFileDescriptors,
      ...extensionsTemplatedFileDescriptors,
    ].map(async (templateFileDescriptor) => {
      const templateTargetName =
        templateFileDescriptor.path.match(isTemplateRegex)?.[1]!;

      const argsPath = templateFileDescriptor.relativePath.replace(
        isTemplateRegex,
        `${templateTargetName}.args.`
      );

      const argsFilesPath = extensions
        .map((extension) => {
          const argsFilePath = path.join(
            extensionDict[extension].path,
            argsPath
          );
          const fileExists = fs.existsSync(argsFilePath);
          if (!fileExists) {
            return [];
          }
          return argsFilePath;
        })
        .flat();

      const args = await Promise.all(
        argsFilesPath.map(async (argsFilePath) => await import(argsFilePath))
      );
      const templateUrl = new URL(`file://${templateFileDescriptor.path}`);
      const template = (await import(templateUrl.href)).default;

      if (!template) {
        throw new Error(
          `Template ${templateTargetName} from ${templateFileDescriptor.source} doesn't have a default export`
        );
      }
      if (typeof template !== "function") {
        throw new Error(
          `Template ${templateTargetName} from ${templateFileDescriptor.source} is not exporting a function by default`
        );
      }

      const freshArgs: { [key: string]: string[] } = Object.fromEntries(
        Object.keys(args[0] ?? {}).map((key) => [
          key, // INFO: key for the freshArgs object
          [], // INFO: initial value for the freshArgs object
        ])
      );
      const combinedArgs: { [key: string]: string[] } = args.reduce(
        (accumulated, arg) => {
          Object.entries(arg).map(([key, value]) => {
            accumulated[key].push(value);
          });
          return accumulated;
        },
        freshArgs
      );

      const output = template(combinedArgs);

      const targetPath = path.join(
        targetDir,
        templateFileDescriptor.relativePath.split(templateTargetName)[0],
        templateTargetName
      );
      fs.writeFileSync(targetPath, output);
    })
  );
};

export async function copyTemplateFiles(
  options: Options,
  templateDir: string,
  targetDir: string
) {
  // 1. Copy base template to target directory
  const basePath = path.join(templateDir, baseDir);
  await copy(basePath, targetDir, {
    clobber: false,
    filter: (fileName) => !isTemplateRegex.test(fileName), // NOTE: filter IN
  });

  // 2. Add "parent" extensions (set via config.json#extend field)
  const expandedExtension = expandExtensions(options);
  options.extensions = expandedExtension;

  // 3. Copy extensions folders
  await copyExtensionsFiles(options, targetDir);

  // 4. Process templated files and generate output
  await processTemplatedFiles(options, basePath, targetDir);

  // 5. Initialize git repo to avoid husky error
  await execa("git", ["init"], { cwd: targetDir });
  await execa("git", ["checkout", "-b", "main"], { cwd: targetDir });
}
