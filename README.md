# 🏗 Scaffold-ETH 2

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/scaffold-eth/scaffold-eth-2.git
cd scaffold-eth-2
yarn install
```

```
yarn chain:foundry
```

```
yarn deploy:foundry {networkNname: optional}
```

```
yarn start
```

# Config

1. Add networks in `packages/foundry/foundry.toml`

```rust
[rpc_endpoints]
localhost = "http://127.0.0.1:8545"
mumbai = "https://rpc.ankr.com/polygon_mumbai"
```

2. Record Contract with different name in `script/Deploy.s.sol`

```solidity
        YourContract yourContract1 = new YourContract(vm.addr(1));

        // this is optional : the original contract name is DEFAULT
        deployments.push(Deployment("YourContract1", address(yourContract1)));
```
