import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { Extension, ExtensionDescriptor, ExtensionDict } from "../types";

export const extensionDict: ExtensionDict = {} as ExtensionDict;

const currentFileUrl = import.meta.url;

const templatesDirectory = path.resolve(
  decodeURI(fileURLToPath(currentFileUrl)),
  "../../templates"
);

/**
 * This function has side effects. It generates the extensionDict.
 *
 * @param basePath the path at which to start the traverse
 * @returns the extensions found in this path. Useful for the recursion
 */
const traverseExtensions = async (basePath: string): Promise<Extension[]> => {
  const extensionsPath = path.resolve(basePath, "extensions");
  let extensions: Extension[];
  try {
    extensions = fs.readdirSync(extensionsPath) as Extension[];
  } catch (error) {
    return [];
  }

  await Promise.all(
    extensions.map(async (ext) => {
      const extPath = path.resolve(extensionsPath, ext);
      const configPath = path.resolve(extPath, "config.json");

      let config: Record<string, string> = {};
      try {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      } catch (error) {
        if (fs.existsSync(configPath)) {
          throw new Error(
            `Couldn't parse existing config.json file.
  Extension: ${ext};
  Config file path: ${configPath}`
          );
        }
      }
      let name = config.name ?? ext;
      let value = ext;

      const subExtensions = await traverseExtensions(extPath);
      const hasSubExtensions = subExtensions.length !== 0;
      const extDescriptor: ExtensionDescriptor = {
        name,
        value,
        path: extPath,
        extensions: subExtensions,
        extends: config.extends as Extension | undefined,
      };
      if (!hasSubExtensions) {
        delete extDescriptor.extensions;
      }
      extensionDict[ext] = extDescriptor;

      return subExtensions;
    })
  );

  return extensions;
};

await traverseExtensions(templatesDirectory);
