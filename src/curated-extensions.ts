import { ExternalExtension } from "./types";
import extensions from "./extensions.json";

const CURATED_EXTENSIONS = extensions.reduce<Record<string, ExternalExtension>>((acc, ext) => {
  if (!ext.branch || !ext.repository || !ext.description) {
    throw new Error(`Extension missing required fields: ${JSON.stringify(ext)}`);
  }

  acc[ext.branch] = {
    repository: ext.repository,
    branch: ext.branch,
  };
  return acc;
}, {});

export { CURATED_EXTENSIONS };
