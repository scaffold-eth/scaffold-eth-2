export type Extension = {
  extensionFlagValue: string;
  repository: string;
  branch?: string;
  // fields useful for scaffoldeth.io
  description: string;
  createEthVersion?: string; // if not present we default to latest
  name?: string; // human readable name, if not present we default to branch or extensionFlagValue on UI
};
