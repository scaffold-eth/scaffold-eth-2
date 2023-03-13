import * as chain from "@wagmi/chains";

type ScaffoldConfig = {
	targetNetwork: chain.Chain;
	pollingInterval: number;
};

const scaffoldConfig: ScaffoldConfig = {
	targetNetwork: chain.hardhat,
	pollingInterval: 30000,
} as const;

export default scaffoldConfig;
