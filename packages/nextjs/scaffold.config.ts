import * as chain from "wagmi/chains";

type TScaffoldConfig = {
  targetNetwork: chain.Chain;
  pollingInterval: number;
  ignoreBuildErrors: boolean;
};

const ScaffoldConfig: TScaffoldConfig = {
  targetNetwork: chain.hardhat,
  pollingInterval: 30000,
  ignoreBuildErrors: false,
} as const;

export default ScaffoldConfig;
