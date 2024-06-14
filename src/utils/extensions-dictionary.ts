import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { Extension, ExtensionDescriptor, ExtensionDict } from "../types";

// global object to store mapping of extension name and its descriptor
export const extensionDict: ExtensionDict = {} as ExtensionDict;

const currentFileUrl = import.meta.url;

const templatesDirectory = path.resolve(decodeURI(fileURLToPath(currentFileUrl)), "../../templates");

/**
 * This function has side effects. It initializes the extensionDict.
 */
const initializeExtensionsDict = (basePath: string) => {
  const extensionsPath = path.resolve(basePath, "extensions");
  let extensions: Extension[];
  try {
    extensions = fs.readdirSync(extensionsPath) as Extension[];
  } catch (error) {
    console.error(`Couldn't read the extensions directory: ${extensionsPath}`);
    return;
  }

  extensions.forEach(ext => {
    const extPath = path.resolve(extensionsPath, ext);
    const configPath = path.resolve(extPath, "config.json");

    let config: Record<string, string> = {};
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8")) as Record<string, string>;
    } catch (error) {
      if (fs.existsSync(configPath)) {
        throw new Error(
          `Couldn't parse existing config.json file.
Extension: ${ext};
Config file path: ${configPath}`,
        );
      }
    }
    const name = config.name ?? ext;
    const value = ext;

    const extDescriptor: ExtensionDescriptor = {
      name,
      value,
      path: extPath,
    };

    extensionDict[ext] = extDescriptor;
  });
};

// This function call will run only once due to Node.js module caching in first import of file
// it won't run again even if imported in multiple files.
initializeExtensionsDict(templatesDirectory);
