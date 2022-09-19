# se-2

A new version of scaffold-eth with its core functionality. Using NextJS, RainbowKit & Wagmi.


## Set up

```
git clone https://github.com/carletex/se-2.git
cd se-2
yarn install

```

1st terminal, frontend

```
yarn start
```

2nd terminal, local blockchain

```
yarn chain
```

3rd terminal, deploy test contract
```
yarn deploy
```

Visit `http://localhost:3000`.

Run smart contract test with `yarn hardhat:test`


## ToDo.

- [ ] Use hardhat-deploy
- [ ] Hardhat contracts json copy to front-end
- [ ] Front-end: Contract UI component (abi.nina / se => remove antd)
- [ ] Front-end: Burner wallets on RainbowKit. 
- [ ] Linter / prettier
- [ ] React Scaffold-eth Context? 
