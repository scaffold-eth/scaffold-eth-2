export type Args = string[];
export type SolidityFramework = "hardhat" | "foundry";
export type ExternalExtensionNameDev = string;

export type ExternalExtension = {
  repository: string;
  branch?: string | null;
};

type BaseOptions = {
  project: string | null;
  install: boolean;
  dev: boolean;
  externalExtension: ExternalExtension | ExternalExtensionNameDev | null;
  solidityFramework: SolidityFramework | "none" | null;
};

export type RawOptions = BaseOptions & {
  help: boolean;
};

export type Options = {
  [Prop in keyof Omit<BaseOptions, "externalExtension" | "solidityFramework">]: NonNullable<BaseOptions[Prop]>;
} & {
  externalExtension: RawOptions["externalExtension"];
  solidityFramework: SolidityFramework | null;
};

export type TemplateDescriptor = {
  path: string;
  fileUrl: string;
  relativePath: string;
  source: string;
};

export type SolidityFrameworkChoices = (SolidityFramework | { value: any; name: string })[];
