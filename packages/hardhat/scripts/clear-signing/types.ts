export type AbiParameter = {
  name?: string;
  type: string;
  components?: AbiParameter[];
};

export type AbiFunction = {
  type: "function";
  name: string;
  inputs?: AbiParameter[];
  outputs?: AbiParameter[];
  stateMutability?: "pure" | "view" | "nonpayable" | "payable";
};

export type AbiItem = AbiFunction | Record<string, unknown>;

export type ClearSigningDeployment = {
  network: string;
  contractName: string;
  chainId: number;
  address: string;
  abi: AbiItem[];
  deploymentFile: string;
  transactionHash?: string;
  blockNumber?: number;
  deployedBytecode?: string;
  compilerMetadata?: string;
  sourceName?: string;
};

export type Visibility = "always" | "never" | "optional" | Record<string, unknown>;

export type DisplayField = {
  $id?: string;
  path?: string;
  value?: string | number | boolean;
  label?: string;
  format?: string;
  params?: Record<string, unknown>;
  visible?: Visibility;
  separator?: string;
  iteration?: "sequential" | "bundled";
  fields?: DisplayField[];
};

export type ClearSigningFunctionConfig = {
  include: boolean;
  reviewed: boolean;
  intent: string;
  interpolatedIntent?: string;
  fields: DisplayField[];
  test: {
    description: string;
    args: unknown[];
    value?: string;
    from?: string;
  };
};

export type DataProvider = {
  tokens?: Record<string, { symbol: string; decimals: number; name: string }>;
  addressNames?: Record<string, string>;
  ensNames?: Record<string, string>;
  nftCollectionNames?: Record<string, string>;
  blockTimestamps?: Record<string, number>;
};

export type ClearSigningConfig = {
  version: 1;
  network: string;
  contract: string;
  entity: string;
  metadata: {
    owner: string;
    contractName: string;
    info: {
      url: string;
    };
  };
  functions: Record<string, ClearSigningFunctionConfig>;
  dataProvider?: DataProvider;
};

export type DescriptorFormat = {
  $id?: string;
  intent: string;
  interpolatedIntent?: string;
  fields: DisplayField[];
};

export type Erc7730Descriptor = {
  $schema: string;
  context: {
    $id: string;
    contract: {
      deployments: Array<{ chainId: number; address: string }>;
    };
  };
  metadata: ClearSigningConfig["metadata"];
  display: {
    formats: Record<string, DescriptorFormat>;
  };
};

export type RenderedField = {
  label: string;
  value: string | RenderedDisplay;
};

export type RenderedDisplay = {
  intent: string;
  interpolatedIntent?: string;
  owner?: string;
  fields: RenderedField[];
};

export type FixtureTest = {
  description: string;
  rawTx: string;
  from?: string;
  expected: RenderedDisplay;
};

export type FixtureFile = {
  $schema: string;
  descriptor: string;
  dataProvider?: DataProvider;
  tests: FixtureTest[];
};

export type SourcifyEvidence = {
  checkedAt: string;
  url: string;
  match: string;
  abiCompatible: boolean;
};

export type GeneratedArtifacts = {
  descriptor: Erc7730Descriptor;
  fixtures: FixtureFile;
  descriptorPath: string;
  fixturePath: string;
  previews: Array<{ signature: string; rendered: RenderedDisplay }>;
};
