import { withDefaults } from "../../../../utils.js";

const content = ({
  extraProfileDefaults,
  extraRpcEndpoints,
  extraEthercsanConfig,
  extraFormattingConfig,
  extraConfig,
}) => `[profile.default]
src = 'contracts'
out = 'out'
libs = ['lib', 'node_modules']
fs_permissions = [{ access = "read-write", path = "./"}]
${extraProfileDefaults.filter(Boolean).join("\n")}

[rpc_endpoints]
default_network = "http://127.0.0.1:8545"

mainnet = "https://eth-mainnet.alchemyapi.io/v2/\${ALCHEMY_API_KEY}"
sepolia = "https://eth-sepolia.g.alchemy.com/v2/\${ALCHEMY_API_KEY}"
arbitrum = "https://arb-mainnet.g.alchemy.com/v2/\${ALCHEMY_API_KEY}"
arbitrumSepolia = "https://arb-sepolia.g.alchemy.com/v2/\${ALCHEMY_API_KEY}"
optimism = "https://opt-mainnet.g.alchemy.com/v2/\${ALCHEMY_API_KEY}"
optimismSepolia = "https://opt-sepolia.g.alchemy.com/v2/\${ALCHEMY_API_KEY}"
polygon = "https://polygon-mainnet.g.alchemy.com/v2/\${ALCHEMY_API_KEY}"
polygonMumbai = "https://polygon-mumbai.g.alchemy.com/v2/\${ALCHEMY_API_KEY}"
polygonZkEvm = "https://zkevm-rpc.com"
polygonZkEvmTestnet = "https://rpc.public.zkevm-test.net"
gnosis = "https://rpc.gnosischain.com"
chiado = "https://rpc.chiadochain.net"
base = "https://mainnet.base.org"
baseSepolia = "https://sepolia.base.org"
scrollSepolia = "https://sepolia-rpc.scroll.io"
scroll = "https://rpc.scroll.io"
pgn = "https://rpc.publicgoods.network"
pgnTestnet = "https://sepolia.publicgoods.network"
${extraRpcEndpoints.filter(Boolean).join("\n")}

localhost = "http://127.0.0.1:8545"

[etherscan]
polygonMumbai = { key = "\${ETHERSCAN_API_KEY}" }
sepolia = { key = "\${ETHERSCAN_API_KEY}" }
${extraEthercsanConfig.filter(Boolean).join("\n")}


[fmt]
line_length = 120
tab_width = 4
quote_style = "double"
bracket_spacing = true
int_types = "long"
${extraFormattingConfig.filter(Boolean).join("\n")}

${extraConfig.filter(Boolean).join("\n")}

# See more config options https://book.getfoundry.sh/reference/config/overview`;

export default withDefaults(content, {
  extraProfileDefaults: "",
  extraRpcEndpoints: "",
  extraEthercsanConfig: "",
  extraFormattingConfig: "",
  extraConfig: "",
});
