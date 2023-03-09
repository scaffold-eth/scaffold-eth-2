import * as chain from "wagmi/chains";

type TScaffoldConfig = {
  targetNetwork: chain.Chain;
  pollingInterval: number;
};

const ScaffoldConfig: TScaffoldConfig = {
  targetNetwork: chain.hardhat,
  pollingInterval: 30000,
} as const;

export default ScaffoldConfig;
