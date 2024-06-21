import { Config, ExternalExtension, typedQuestion } from "./types";
import { SOLIDITY_FRAMEWORKS } from "./utils/consts";

const config: Config = {
  questions: [
    typedQuestion({
      type: "single-select",
      name: "solidityFramework",
      message: "What solidity framework do you want to use?",
      extensions: [SOLIDITY_FRAMEWORKS.HARDHAT, SOLIDITY_FRAMEWORKS.FOUNDRY, null],
      default: SOLIDITY_FRAMEWORKS.HARDHAT,
    }),
  ],
};

const CURATED_EXTENSIONS: { [key: string]: ExternalExtension } = {
  subgraph: {
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "subgraph",
  },
  "eip-712": {
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "eip-712",
  },
};

export { config, CURATED_EXTENSIONS };
