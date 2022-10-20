import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import fs from "fs";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
dotenv.config();

// If not set, it uses the Alchemy's default API key.
const providerApiKey =
  process.env.ALCHEMY_API_KEY ?? "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC";
// If not set, it uses the hardhat account 0 private key.
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ??
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first account as deployer
      default: 0,
    },
  },
  networks: {
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    arbitrumGoerli: {
      url: `https://arb-goerli.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    optimisim: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    optimisimKovan: {
      url: `https://opt-kovan.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    polygonMumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
  },
  solidity: "0.8.15",
};

export default config;

const DEBUG = true;

function debug(text: string) {
  if (DEBUG) {
    console.log(text);
  }
}

function mnemonic() {
  try {
    return fs.readFileSync("./mnemonic.txt").toString().trim();
  } catch (e) {
    if (config.defaultNetwork !== "localhost") {
      console.log(
        "☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`."
      );
    }
  }
  return "";
}

task(
  "generate",
  "Create a mnemonic for builder deploys",
  async () => {
    if (!fs.readFileSync("./mnemonic.txt")) {
      const bip39 = require("bip39");
      const { hdkey } = require("ethereumjs-wallet")
      const mnemonic = bip39.generateMnemonic();
      if (DEBUG) console.log("mnemonic", mnemonic);
      const seed = await bip39.mnemonicToSeed(mnemonic);
      if (DEBUG) console.log("seed", seed);
      const hdwallet = hdkey.fromMasterSeed(seed);
      if (DEBUG) console.log("hdwallet", hdwallet);
      const wallet_hdpath = "m/44'/60'/0'/0/";
      const account_index = 0;
      const fullPath = wallet_hdpath + account_index;
      if (DEBUG) console.log("fullPath", fullPath);
      const wallet = hdwallet.derivePath(fullPath).getWallet();
      if (DEBUG) console.log("wallet", wallet);
      const privateKey = "0x" + wallet.privateKey.toString("hex");
      if (DEBUG) console.log("privateKey", privateKey);
      const EthUtil = require("@nomicfoundation/ethereumjs-util");
      const address =
        "0x" + EthUtil.privateToAddress(privateKey).toString("hex");
      console.log(
        "🔐 Account Generated as " +
        address +
        " and set as mnemonic in packages/hardhat"
      );
      console.log(
        "💬 Use 'yarn run account' to get more information about the deployment account."
      );

      fs.writeFileSync("./" + address + ".txt", mnemonic.toString());
      fs.writeFileSync("./mnemonic.txt", mnemonic.toString());
    } else {
      console.log("🔐 Account already generated");
    }
  }
);

task(
  "account",
  "Get balance informations for the deployment account.",
  async (_, { ethers }: { ethers: any }) => {
    const { hdkey } = require('ethereumjs-wallet')
    const bip39 = require("bip39");
    try {
      const mnemonic = fs.readFileSync("./mnemonic.txt").toString().trim();
      if (DEBUG) console.log("mnemonic", mnemonic);
      const seed = await bip39.mnemonicToSeed(mnemonic);
      if (DEBUG) console.log("seed", seed);
      const hdwallet = hdkey.fromMasterSeed(seed);
      const wallet_hdpath = "m/44'/60'/0'/0/";
      const account_index = 0;
      const fullPath = wallet_hdpath + account_index;
      if (DEBUG) console.log("fullPath", fullPath);
      const wallet = hdwallet.derivePath(fullPath).getWallet();
      const privateKey = "0x" + wallet.privateKey.toString("hex");
      if (DEBUG) console.log("privateKey", privateKey);
      const EthUtil = require("@nomicfoundation/ethereumjs-util");
      const address =
        "0x" + EthUtil.privateToAddress(wallet.privateKey).toString("hex");

      const qrcode = require("qrcode-terminal");
      qrcode.generate(address);
      console.log("‍📬 Deployer Account is " + address);
      for (const network in config.networks) {
        try {
          const provider = new ethers.providers.JsonRpcProvider(
            config.networks[network]?.url
          );
          const balance = await provider.getBalance(address);
          console.log(" -- " + network + " --  -- -- 📡 ");
          console.log("   balance: " + ethers.utils.formatEther(balance));
          console.log(
            "   nonce: " + (await provider.getTransactionCount(address))
          );
        } catch (e) {
          if (DEBUG) {
            console.log(e);
          }
        }
      }
    } catch (err) {
      console.log("--- Looks like there is no mnemonic file created yet.");
      console.log(
        "--- Please run yarn generate to create one"
      );
    }
  }
);