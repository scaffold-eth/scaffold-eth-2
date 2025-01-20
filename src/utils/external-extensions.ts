import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ExternalExtension, RawOptions, SolidityFramework } from "../types";
import { CURATED_EXTENSIONS } from "../curated-extensions";
import { SOLIDITY_FRAMEWORKS } from "./consts";

function deconstructGithubUrl(url: string) {
  const urlParts = url.split("/");
  const ownerName = urlParts[3];
  const repoName = urlParts[4];
  const branch = urlParts[5] === "tree" ? urlParts[6] : undefined;

  return { ownerName, repoName, branch };
}

// Gets the data from the argument passed to the `--extension` option.
export const getDataFromExternalExtensionArgument = (externalExtension: string) => {
  if (CURATED_EXTENSIONS[externalExtension]) {
    externalExtension = getArgumentFromExternalExtensionOption(CURATED_EXTENSIONS[externalExtension]);
  }

  const isGithubUrl = externalExtension.startsWith("https://github.com/");

  // Check format: owner/project:branch (branch is optional)
  const regex = /^[^/]+\/[^/]+(:[^/]+)?$/;
  if (!regex.test(externalExtension) && !isGithubUrl) {
    throw new Error(`Invalid extension format. Use "owner/project", "owner/project:branch" or github url.`);
  }

  let owner;
  let project;
  let branch;

  if (isGithubUrl) {
    const { ownerName, repoName, branch: urlBranch } = deconstructGithubUrl(externalExtension);
    owner = ownerName;
    project = repoName;
    branch = urlBranch;
  } else {
    // Extract owner, project and branch if format passed is owner/project:branch
    owner = externalExtension.split("/")[0];
    project = externalExtension.split(":")[0].split("/")[1];
    branch = externalExtension.split(":")[1];
  }

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
};

// Parse the externalExtensionOption object into a argument string.
// e.g. { repository: "owner/project", branch: "branch" } => "owner/project:branch"
export const getArgumentFromExternalExtensionOption = (externalExtensionOption: RawOptions["externalExtension"]) => {
  const { repository, branch } = (externalExtensionOption as ExternalExtension) || {};

  const owner = repository?.split("/")[3];
  const project = repository?.split("/")[4];

  return `${owner}/${project}${branch ? `:${branch}` : ""}`;
};

// Gets the solidity framework directories from the external extension repository
export const getSolidityFrameworkDirsFromExternalExtension = async (
  externalExtension: NonNullable<RawOptions["externalExtension"]>,
) => {
  const solidityFrameworks = Object.values(SOLIDITY_FRAMEWORKS);
  const filterSolidityFrameworkDirs = (dirs: string[]) => {
    return dirs.filter(dir => solidityFrameworks.includes(dir as SolidityFramework)).reverse() as SolidityFramework[];
  };

  if (typeof externalExtension === "string") {
    const currentFileUrl = import.meta.url;
    const externalExtensionsDirectory = path.resolve(
      decodeURI(fileURLToPath(currentFileUrl)),
      "../../externalExtensions",
    );

    const externalExtensionSolidityFrameworkDirs = await fs.promises.readdir(
      `${externalExtensionsDirectory}/${externalExtension}/extension/packages`,
    );

    return filterSolidityFrameworkDirs(externalExtensionSolidityFrameworkDirs);
  }

  const { branch, repository } = externalExtension;
  const { ownerName, repoName } = deconstructGithubUrl(repository);
  const githubApiUrl = `https://api.github.com/repos/${ownerName}/${repoName}/contents/extension/packages${branch ? `?ref=${branch}` : ""}`;
  const res = await fetch(githubApiUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch the githubApiUrl ${githubApiUrl}`);
  }
  const listOfContents = (await res.json()) as { name: string; type: "dir" | "file" }[];
  const directories = listOfContents.filter(item => item.type === "dir").map(dir => dir.name);

  return filterSolidityFrameworkDirs(directories);
};
