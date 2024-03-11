# create-eth

## 0.0.35

### Patch Changes

- Yarn flatten (#745, 62553fd)
- Add format with prettier task (b03c011)
- Fix local next build (#749)
- Fix emit event value in contract (#765, 833d09b)
- Fix useScaffoldContractWrite so it properly throws errors (#758)
- Fix vercel deployment mismatch (#757)
- Remove extra notifications when using useTransactor (#766)
- Ignore JetBrains IDE settings file (#732)
- Fix hardhat lint errors (ac1d2ac)

## 0.0.34

### Patch Changes

- 092f2ad: 1. basic example to show connected address (#721) 2. Standardize displaying of address and follow ERC-55 (#734) 3. fix contract balance hot reload balance issue (#739) 4. Fix cursor stealing & display loading for AddressInput (#738) 5. Fix blockexplorer code tab (#741) 6. Match link name with actual tab name for Debug Contracts (#743)

## 0.0.33

### Patch Changes

- Feat: Better complex struct inputs (#702)
- improve debug struct UI (#726)
- use next-themes to handle theme and update usehooks-ts (#707)
- up rainbowkit version to 1.3.5 (#719)
- Use arbitrumSepolia instead of Goerli (#716)
- Add Optimism Sepolia config (#711)
- Update screenshot example on Readme (#705)
- add use client to inputs barrel file (#699)
- add baseSepolia in hardhat.config (#696)
- removed "use client" from EtherInput, IntergerInput and AddessInput (#688)

## 0.0.32

### Patch Changes

- App router migration (#535)
- Update hardhat package plugins and add hardhat-verify (#637)
- Update homepage file route and add Viem to README tech stack (#691)
- Ethers v6 migration in hardhat (#692)

## 0.0.31

### Patch Changes

- Track hardhat-deploy deployments, except localhost (#666)
- feat: add external flag to external contracts (#647)
- Remove `.github/ISSUE_TEMPLATE` and pull request template when using npx

## 0.0.30

### Patch Changes

- Daisy UI: update to v4 (#656)
- JSDoc cleanup (#665)
- use default values for safeConnector (#667)
- Typos (#668)
- Remove custom Spinner component (#669)

## 0.0.29

### Patch Changes

- Update wagmi to latest version: (#660)
- Fix externalContracts object example code (#653)
- Add question for installation method in template Issue (#651)

## 0.0.28

### Patch Changes

- a9d873d: - Allow user to set his preference for AddressType in `abi.d.ts` (#630 & #641)
  - Check for exact path segment for inheritedFunctions sources (#643)
  - Fix displaying of custom solidity errors (#638)
  - Check cause?.data on getParsedError (#649)

## 0.0.27

### Patch Changes

- Feat/support multi chain (#615)
- Add links to the docs for components and hooks (#620)
- Fix useScaffoldEventHistory hook new events order (#622)
- Add requiredFilters param to useScaffoldEventHistory hook (#621)
- update wagmi, viem and rainbowkit versions (#626)
- Refactor: types/interfaces (#627)

## 0.0.26

### Patch Changes

- Show inherited functions in Debug page (when deploying with foundry)
- Add disableMultiplyBy1e18 flag to IntegerInput component (#609)
- Add pooling interval to EventHistory hook (#597)
- Fix AbiFunctionReturnType removing [0] (#610)

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
