import type { UserConfig } from "rocketh/types";
import { privateKey } from "@rocketh/signer";
import * as deployExtension from "@rocketh/deploy";
import * as readExecuteExtension from "@rocketh/read-execute";

// Named accounts — deployer at index 0, matching SE-2's v1 pattern
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

const extensions = {
  ...deployExtension,
  ...readExecuteExtension,
};
export { extensions };

// Type exports for use in deploy.ts and environment.ts
type Extensions = typeof extensions;
type Accounts = typeof config.accounts;
type Data = typeof config.data;
export type { Extensions, Accounts, Data };
