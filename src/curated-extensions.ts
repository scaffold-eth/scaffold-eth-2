import { ExternalExtension } from "./types";
import curatedExtension from "./extensions.json";

type ExtensionJSON = {
  extensionFlagValue: string;
  repository: string;
  branch?: string;
  // fields usefull for scaffoldeth.io
  description: string;
  version?: string; // if not present we default to latest
  name?: string; // human redable name, if not present we default to branch or extensionFlagValue on UI
};

const extensions: ExtensionJSON[] = curatedExtension;

const CURATED_EXTENSIONS = extensions.reduce<Record<string, ExternalExtension>>((acc, ext) => {
  if (!ext.repository) {
    throw new Error(`Extension must have 'repository': ${JSON.stringify(ext)}`);
  }
  if (!ext.extensionFlagValue) {
    throw new Error(`Extension must have 'extensionFlag': ${JSON.stringify(ext)}`);
  }

  acc[ext.extensionFlagValue] = {
    repository: ext.repository,
    branch: ext.branch,
  };
  return acc;
}, {});

export { CURATED_EXTENSIONS };
