import { ExternalExtension } from "./types";
import extensionsJson from "./extensions.json";

type ExtensionWithFlag = ExternalExtension & {
  extensionFlagValue: string;
};

const extensions: ExtensionWithFlag[] = extensionsJson;

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
