import { RawOptions } from "../types";
import { CURATED_EXTENSIONS } from "../config";

// Gets the data from the argument passed to the `--extension` option.
// e.g. owner/project:branch => { githubBranchUrl, githubUrl, branch, owner, project }
export const getDataFromExternalExtensionArgument = (externalExtension: string) => {
  if (CURATED_EXTENSIONS[externalExtension]) {
    externalExtension = getArgumentFromExternalExtensionOption(CURATED_EXTENSIONS[externalExtension]);
  }

  // Check format: owner/project:branch (branch is optional)
  const regex = /^[^/]+\/[^/]+(:[^/]+)?$/;
  if (!regex.test(externalExtension)) {
    throw new Error(
      `Invalid extension format. Use "owner/project" or "owner/project:branch"`
    );
  }

  // Extract owner, project and branch
  const owner = externalExtension.split("/")[0];
  const project = externalExtension.split(":")[0].split("/")[1];
  const branch = externalExtension.split(":")[1];

  const githubUrl = `https://github.com/${owner}/${project}`;
  let githubBranchUrl;
  if (branch) {
    githubBranchUrl = `https://github.com/${owner}/${project}/tree/${branch}`;
  }

  return {
    githubBranchUrl: githubBranchUrl ?? githubUrl,
    githubUrl,
    branch,
    owner,
    project,
  };
}

// Parse the externalExtensionOption object into a argument string.
// e.g. { repository: "owner/project", branch: "branch" } => "owner/project:branch"
export const getArgumentFromExternalExtensionOption = (externalExtensionOption: RawOptions["externalExtension"]) => {
  const { repository, branch } = externalExtensionOption || {};

  const owner = repository?.split("/")[3];
  const project = repository?.split("/")[4];

  return `${owner}/${project}${branch ? `:${branch}` : ""}`;
}
