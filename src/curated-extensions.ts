import { ExternalExtension } from "./types";
import extensions from "./extensions.json";

type ExtensionWithFlag = ExternalExtension & {
  extensionFlag?: string;
};

const CURATED_EXTENSIONS = extensions.reduce<Record<string, ExtensionWithFlag>>((acc, ext: ExtensionWithFlag) => {
  if (!ext.repository) {
    throw new Error(`Extension missing 'repository' fields: ${JSON.stringify(ext)}`);
  }
  if (!ext.branch && !ext.extensionFlag) {
    throw new Error(`Extension must have either 'branch' or 'extensionFlag': ${JSON.stringify(ext)}`);
  }

  const key = ext.branch || ext.extensionFlag;
  acc[key!] = {
    repository: ext.repository,
    branch: ext.branch,
  };
  return acc;
}, {});

export { CURATED_EXTENSIONS };
