const contents = () =>
  `# Template for foundry environment variables.

# For local development, copy this file, rename it to .env, and fill in the values.

# We provide default values so developers can start prototyping out of the box,
# but we recommend getting your own API Keys for Production Apps.

# Alchemy rpc URL is used while deploying the contracts to some testnets/mainnets, checkout \`foundry.toml\` for it's use.
ALCHEMY_API_KEY=oKxs-03sij-U_N0iOlrSsZFr29-IqbuF

# Etherscan API key is used to verify the contract on etherscan.
ETHERSCAN_API_KEY=DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW

# Keystore account name to be used while deploying contracts on local anvil chain (defaults to scaffold-eth-default which is anvil's 9th account)
# To use a custom keystore account, you can change the value of LOCALHOST_KEYSTORE_ACCOUNT=my-account-name
LOCALHOST_KEYSTORE_ACCOUNT=scaffold-eth-default`;

export default contents;
