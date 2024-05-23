import { Config, ExternalExtension, typedQuestion } from "./types";

const config: Config = {
  questions: [
    typedQuestion({
      type: "single-select",
      name: "solidity-framework",
      message: "What solidity framework do you want to use?",
      extensions: ["hardhat", "foundry", null],
      default: "hardhat",
    }),
  ],
};

const CURATED_EXTENSIONS: { [key: string]: ExternalExtension } = {
  subgraph: {
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "subgraph",
  }
}

export { config, CURATED_EXTENSIONS };
