import type { Args, RawOptions } from "../types";
import arg from "arg";
import * as https from "node:https";

const validateTemplate = async (
  template: string
): Promise<{ repository: string; branch?: string }> => {
  // Check format: owner/project:branch (branch is optional)
  const regex = /^[^/]+\/[^/]+(:[^/]+)?$/;
  if (!regex.test(template)) {
    throw new Error(
      `Invalid template format. Use "owner/project" or "owner/project:branch"`
    );
  }

  // Extract owner, project and branch
  const owner = template.split("/")[0];
  const project = template.split(":")[0].split("/")[1];
  const branch = template.split(":")[1];

  // Check if the repo exists.
  let githubUrl = "";
  if (branch) {
    githubUrl = `https://github.com/${owner}/${project}/tree/${branch}`;
  } else {
    githubUrl = `https://github.com/${owner}/${project}`;
  }

  await new Promise((resolve, reject) => {
    https
      .get(githubUrl, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Template not found: ${githubUrl}`));
        } else {
          resolve(null);
        }
      })
      .on("error", (err) => {
        reject(err);
      });
  });

  return { repository: `${owner}/${project}`, branch };
};

// TODO update smartContractFramework code with general extensions
export async function parseArgumentsIntoOptions(
  rawArgs: Args
): Promise<RawOptions> {
  const args = arg(
    {
      "--install": Boolean,
      "-i": "--install",

      "--skip-install": Boolean,
      "--skip": "--skip-install",
      "-s": "--skip-install",

      "--dev": Boolean,

      "--template": String,
      "-t": "--template",
    },
    {
      argv: rawArgs.slice(2).map((a) => a.toLowerCase()),
    }
  );

  const install = args["--install"] ?? null;
  const skipInstall = args["--skip-install"] ?? null;
  const hasInstallRelatedFlag = install || skipInstall;

  const dev = args["--dev"] ?? false; // info: use false avoid asking user

  const project = args._[0] ?? null;

  const template = args["--template"]
    ? await validateTemplate(args["--template"])
    : null;

  console.log("");

  return {
    project,
    install: hasInstallRelatedFlag ? install || !skipInstall : null,
    dev,
    extensions: null, // TODO add extensions flags
    template,
  };
}
