import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { task } from "hardhat/config";
import generateTsAbis from "./scripts/generateTsAbis";

// If not set, it uses the hardhat account 0 private key.
// You can generate a random account with `yarn generate` or `yarn account:import` to import your existing PK
const deployerPrivateKey =
  process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// If not set, it uses our block explorers default API keys.
const etherscanApiKey = process.env.ETHERSCAN_MAINNET_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";
const etherscanArbitrumApiKey = process.env.ETHERSCAN_ARBITRUM_API_KEY || "R9X53I6K48FA8BTXC1UI6H8UMU5NU7Z1Y2";
const etherscanOptimisticApiKey = process.env.ETHERSCAN_OPTIMISTIC_API_KEY || "RM62RDISS1RH448ZY379NX625ASG1N633R";
const etherscanPolygonApiKey = process.env.ETHERSCAN_POLYGON_API_KEY || "YVW76HDWKVVN2IDZWGAHFBPKVSKHYK3KZP";
const etherscanPolygonZkEvmApiKey = process.env.ETHERSCAN_POLYGON_ZKEVM_API_KEY || "JM598H75YBWKGNW9X3FB1BH2I48BHXBGIQ";
const etherscanGnosisApiKey = process.env.ETHERSCAN_GNOSIS_API_KEY || "RH1ZHBF92AUMWT6Z2JEJAMYJWR6CH2X7KZ";
const etherscanChiadoApiKey = process.env.ETHERSCAN_CHIADO_API_KEY || "a1a62bdd-fba0-4a54-ad05-fb88c765b962";
const basescanApiKey = process.env.BASESCAN_API_KEY || "ZZZEIPMT1MNJ8526VV2Y744CA7TNZR64G6";
const etherscanScrollApiKey = process.env.ETHERSCAN_SCROLL_API_KEY || "GW76ZR67CQ9XA18ARWRHFBTNGAY98EW9CD";
const etherscanCeloApiKey = process.env.ETHERSCAN_CELO_API_KEY || "1RZ6V5E76VQANQHZS2ITHN2YWZAUP9SF3S";

// If not set, it uses ours Alchemy's default API key.
// You can get your own at https://dashboard.alchemyapi.io
const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api.etherscan.io/api",
          apiKey: etherscanApiKey,
        },
      },
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.etherscan.io/api",
          apiKey: etherscanApiKey,
        },
      },
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api.arbiscan.io/api",
          apiKey: etherscanArbitrumApiKey,
        },
      },
    },
    arbitrumSepolia: {
      url: `https://arb-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.arbiscan.io/api",
          apiKey: etherscanArbitrumApiKey,
        },
      },
    },
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api-optimistic.etherscan.io",
          apiKey: etherscanOptimisticApiKey,
        },
      },
    },
    optimismSepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia-optimistic.etherscan.io",
          apiKey: etherscanOptimisticApiKey,
        },
      },
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api.polygonscan.com/api",
          apiKey: etherscanPolygonApiKey,
        },
      },
    },
    polygonMumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api-testnet.polygonscan.com/api",
          apiKey: etherscanPolygonApiKey,
        },
      },
    },
    polygonZkEvm: {
      url: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api-zkevm.polygonscan.com/api",
          apiKey: etherscanPolygonZkEvmApiKey,
        },
      },
    },
    polygonZkEvmTestnet: {
      url: `https://polygonzkevm-testnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api-cardona-zkevm.polygonscan.com/api",
          apiKey: etherscanPolygonZkEvmApiKey,
        },
      },
    },
    gnosis: {
      url: "https://rpc.gnosischain.com",
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api.gnosisscan.io/api",
          apiKey: etherscanGnosisApiKey,
        },
      },
    },
    chiado: {
      url: "https://rpc.chiadochain.net",
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://eth-sepolia.blockscout.com/api",
          apiKey: etherscanChiadoApiKey,
        },
      },
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org",
          apiKey: basescanApiKey,
        },
      },
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.basescan.org",
          apiKey: basescanApiKey,
        },
      },
    },
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io",
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.scrollscan.com/api",
          apiKey: etherscanScrollApiKey,
        },
      },
    },
    scroll: {
      url: "https://rpc.scroll.io",
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api.scrollscan.com/api",
          apiKey: etherscanScrollApiKey,
        },
      },
    },
    pgn: {
      url: "https://rpc.publicgoods.network",
      accounts: [deployerPrivateKey],
    },
    pgnTestnet: {
      url: "https://sepolia.publicgoods.network",
      accounts: [deployerPrivateKey],
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api.celoscan.io/api",
          apiKey: etherscanCeloApiKey,
        },
      },
    },
    celoAlfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api-alfajores.celoscan.io/api",
          apiKey: etherscanCeloApiKey,
        },
      },
    },
  },
  // configuration for harhdat-verify plugin
  etherscan: {
    apiKey: `${etherscanApiKey}`,
  },
  // configuration for etherscan-verify from hardhat-deploy plugin
  verify: {
    etherscan: {
      apiKey: `${etherscanApiKey}`,
    },
  },
  sourcify: {
    enabled: false,
  },
};

// Extend the deploy task
task("deploy").setAction(async (args, hre, runSuper) => {
  // Run the original deploy task
  await runSuper(args);
  // Force run the generateTsAbis script
  await generateTsAbis(hre);
});

export default config;
