import type { UserConfig } from "rocketh/types";
import { privateKey } from "@rocketh/signer";
import * as deployExtension from "@rocketh/deploy";
import * as readExecuteExtension from "@rocketh/read-execute";

export const config = {
  accounts: {
    deployer: {
      default: 0,
    },
  },
  data: {},
  signerProtocols: {
    privateKey,
  },
} as const satisfies UserConfig;

// TODO: Remove this wrapper when hardhat-deploy adds native --reset support
// Tracking issue: https://github.com/wighawag/hardhat-deploy/issues/592
const deployWithReset = ((env: any) => {
  const deployFn = deployExtension.deploy(env);
  return (name: any, args: any, options?: any) => {
    const isReset = process.env.HARDHAT_DEPLOY_RESET === "true";
    return deployFn(name, args, { ...options, alwaysOverride: isReset || options?.alwaysOverride });
  };
}) as typeof deployExtension.deploy;

const extensions = {
  ...deployExtension,
  ...readExecuteExtension,
  deploy: deployWithReset,
};
export { extensions };

// Type exports for use in deploy.ts and environment.ts
type Extensions = typeof extensions;
type Accounts = typeof config.accounts;
type Data = typeof config.data;
export type { Extensions, Accounts, Data };
