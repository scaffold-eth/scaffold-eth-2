# create-eth

## 0.0.25

### Patch Changes

- 0135237: - Fix typos in comments (#596)
  - Show inherited functions in Debug (when deploying with hardhat) (#564)

## 0.0.24

### Patch Changes

- 06ba1eb: - remove chainId from useContractWrite (#584)
  - Add copy to clipboard to TxReceipt (#590)
  - Add event logs to transaction page (#591)
  - deployedContracts & externalContracts (#592)

## 0.0.23

### Patch Changes

- 30d9000:

  1. Extract header menu links (#570)
  2. Move Block Explorer to footer (#574)
  3. Remove ExampleUI (pages, components, assets, content) (#578)
  4. update wagmi, viem, rainbowkit (#580) 5. add zkSync, scroll & polygonZkEvm to foundry.toml ([88b4218](https://github.com/scaffold-eth/scaffold-eth-2/pull/582/commits/88b421860a5260d2c8ad4877adaf07c1d667f2b6))

## 0.0.22

### Patch Changes

- 16f1a72: Tweak DaisyUI link (#560)

  Improve ENS support (accept all TLDs) (#563)

  fix: memo history events (#565)

  update DEVELOPER-GUIDE.md with backmerge-main instructions

## 0.0.21

### Patch Changes

- 9c967d9: 1. Fix RainbowKitCustomConnectButton dropdown styles (#500)

  2. chore: footer missalignment & home page on small screens (#502)

  3. Update and typescript version (#499)

  4. fix: header links wrapping icons and text (#510)

  5. Fix typos in useScaffoldContractWrite logs (#512)

  6. fix: spelling in test file name (#522)

  7. Add polygonZkEvm and polygonZkEvmTestnet (#309)

  8. fix: eth price showing 0 on sepolia network (#532)

  9. use websockets client in useFetchBlocks hooks (#529)

  10. Move from react-blockies to blo (#538)

  11. add Prettify type helper locally (#541)

  12. update hardhat version (#546)

  13. Add indexed args to events (#540)

  14. add out of box compatibility with SAFE{Wallet} (#346)

  15. remove parseEther from useScaffoldContractWrite (#548)

  16. Add Scroll Sepolia testnet (#547)

  17. use BuidlGuidl logo on footer (#551)

  18. add types to even data in useScaffoldEventHistory (#553)

  19. foundry: add chain id 31337 while forking chain (#531)

## 0.0.20

### Patch Changes

- 32caee5: 1. Fix RainbowKitCustomConnectButton dropdown styles #500

  2. chore: footer missalignment on mobile screens #502

  3. Update and typescript version #499

  4. add grid and grid-flow class to li manually #510

  5. Fix typos in getScaffoldContractWrite lines 57 & 65 #512

  6. fix: test file name #522

  7. add support for `yarn verify --network networkName` in foundry similar to hardhat #489

  8. updated the Git task title from "Initializing Git repository" => "Initializing Git repository and submodules" when the user selects foundry as an extension
