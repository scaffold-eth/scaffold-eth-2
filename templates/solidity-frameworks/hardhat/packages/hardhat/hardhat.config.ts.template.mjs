import { withDefaults, stringify, deepMerge } from "../../../../utils.js";

const defaultConfig = {
  plugins: '$$[hardhatToolbox, HardhatDeploy]$$',
  solidity: {
    compilers: [
      {
        version: "0.8.30",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  generateTypedArtifacts: {
    destinations: [
      {
        folder: "./generated",
        mode: "typescript",
      },
    ],
  },
  verify: {
    etherscan: {
      apiKey: "$$etherscanApiKey$$",
    },
  },
  networks: {
    default: {
      type: "http",
      url: "http://127.0.0.1:8545",
    },
    hardhat: {
      type: "edr-simulated",
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/\${providerApiKey}`,
        enabled: '$$process.env.MAINNET_FORKING_ENABLED === "true"$$',
      },
    },
    mainnet: {
      type: "http",
      url: "https://mainnet.rpc.buidlguidl.com",
      accounts: ["$$deployerPrivateKey$$"],
    },
    sepolia: {
      type: "http",
      url: `https://eth-sepolia.g.alchemy.com/v2/\${providerApiKey}`,
      accounts: ["$$deployerPrivateKey$$"],
    },
    optimism: {
      type: "http",
      url: `https://opt-mainnet.g.alchemy.com/v2/\${providerApiKey}`,
      accounts: ["$$deployerPrivateKey$$"],
    },
    optimismSepolia: {
      type: "http",
      url: `https://opt-sepolia.g.alchemy.com/v2/\${providerApiKey}`,
      accounts: ["$$deployerPrivateKey$$"],
    },
    base: {
      type: "http",
      url: "https://mainnet.base.org",
      accounts: ["$$deployerPrivateKey$$"],
    },
    baseSepolia: {
      type: "http",
      url: "https://sepolia.base.org",
      accounts: ["$$deployerPrivateKey$$"],
    },
    arbitrum: {
      type: "http",
      url: `https://arb-mainnet.g.alchemy.com/v2/\${providerApiKey}`,
      accounts: ["$$deployerPrivateKey$$"],
    },
    arbitrumSepolia: {
      type: "http",
      url: `https://arb-sepolia.g.alchemy.com/v2/\${providerApiKey}`,
      accounts: ["$$deployerPrivateKey$$"],
    },
    scroll: {
      type: "http",
      url: "https://rpc.scroll.io",
      accounts: ["$$deployerPrivateKey$$"],
    },
    celo: {
      type: "http",
      url: "https://forno.celo.org",
      accounts: ["$$deployerPrivateKey$$"],
    },
    celoSepolia: {
      type: "http",
      url: "https://forno.celo-sepolia.celo-testnet.org/",
      accounts: ["$$deployerPrivateKey$$"],
    },
    polygon: {
      type: "http",
      url: `https://polygon-mainnet.g.alchemy.com/v2/\${providerApiKey}`,
      accounts: ["$$deployerPrivateKey$$"],
    },
    polygonAmoy: {
      type: "http",
      url: `https://polygon-amoy.g.alchemy.com/v2/\${providerApiKey}`,
      accounts: ["$$deployerPrivateKey$$"],
    },
    gnosis: {
      type: "http",
      url: "https://rpc.gnosischain.com",
      accounts: ["$$deployerPrivateKey$$"],
    },
    chiado: {
      type: "http",
      url: "https://rpc.chiadochain.net",
      accounts: ["$$deployerPrivateKey$$"],
    },
  },
  tasks: '$$deployTasks$$',
};

const contents = ({ preContent, configOverrides }) => {
  // Merge the default config with any overrides
  const finalConfig = deepMerge(defaultConfig, configOverrides[0] || {});

  return `import "dotenv/config";
import { defineConfig, overrideTask } from "hardhat/config";
import hardhatToolbox from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import HardhatDeploy from "hardhat-deploy";
import generateTsAbis from "./scripts/generateTsAbis.js";
${preContent[0] || ''}

// If not set, it uses the hardhat account 0 private key.
// You can generate a random account with \`yarn generate\` or \`yarn account:import\` to import your existing PK
const deployerPrivateKey =
  process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// If not set, it uses ours Alchemy's default API key.
// You can get your own at https://dashboard.alchemyapi.io
const providerApiKey = process.env.ALCHEMY_API_KEY || "IZYEU2cWBgnFmgiTAgpWD";

export const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

const deployTasks = [
  overrideTask("deploy")
    .setInlineAction(async (args, _hre, runSuper) => {
      // Run the original deploy task
      await runSuper(args);
      // Force run the generateTsAbis script
      await generateTsAbis();
    })
    .build(),
];

export default defineConfig(${stringify(finalConfig, {
    "solidity.compilers.0.settings.optimizer.runs":
      "https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options",
    "networks.default":
      "View the networks that are pre-configured.\nIf the network you are looking for is not here you can add new network settings",
    verify: "Configuration for hardhat-verify and rocketh-verify",
  })});`;
};

export default withDefaults(contents, {
  preContent: "",
  configOverrides: {},
});
