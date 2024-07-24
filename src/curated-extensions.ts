import { ExternalExtension } from "./types";

const CURATED_EXTENSIONS: { [key: string]: ExternalExtension } = {
  subgraph: {
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "subgraph",
  },
  "eip-712": {
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "eip-712",
  },
  ponder: {
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "ponder",
  },
};

export { CURATED_EXTENSIONS };
