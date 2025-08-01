# create-eth

## 1.0.3

### Patch Changes

- fix: getting deployedOnBlock when no receipt (<https://github.com/scaffold-eth/scaffold-eth-2/pull/1143>)
-   fix contract interactions error (<https://github.com/scaffold-eth/scaffold-eth-2/pull/1146>)
-   fix `useScaffoldEventHistory` to properly calculate `nextBlock` (<https://github.com/scaffold-eth/scaffold-eth-2/pull/1144>)

## 1.0.2

### Patch Changes

- Use `deployedOnBlock` from deployedContracts in useScaffoldEventHistory (https://github.com/scaffold-eth/scaffold-eth-2/pull/1134)
- Reveal burner pk option (https://github.com/scaffold-eth/scaffold-eth-2/pull/1137)
- Add cursor rules example for `useScaffoldEventHistory` (https://github.com/scaffold-eth/scaffold-eth-2/pull/1141)

## 1.0.1

### Patch Changes

- fix foundry verify script
- Add deployedOnBlock to deployedContracts on Hardhat (https://github.com/scaffold-eth/scaffold-eth-2/pull/1132)
- update hardhat mainnet rpc url (https://github.com/scaffold-eth/scaffold-eth-2/pull/1130)

## 1.0.0

### Major Changes

- adjust level of customization and improved ways to pass args to tmeplates

## 1.0.0-beta.6

### Patch Changes

- b897e43: fix providers rendering the whole tree

## 1.0.0-beta.5

### Patch Changes

- 2e0b44b: foundry: allow extensions to add library
- 4187258: fix foundry .env.example
- 0d12cec: Fetch solidity framework folder correctly for default git branch

## 1.0.0-beta.4

### Patch Changes

- f3854cc: backmerge main

## 1.0.0-beta.3

### Patch Changes

- rename arg `preConfigContent` => `preContent`
- new way of passing providers to `ScaffoldEthAppWithProviders.tsx` checkout [ScaffoldEthAppWithProviders.tsx.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/components/ScaffoldEthAppWithProviders.tsx.args.mjs)
- readme arg `extraContent` => `extraContents`
- manifest.json.template.mjs arg `extraContent` => `extraContents`

## 1.0.0-beta.2

### Patch Changes

- allow more customization with `preConfigContent` arg
  - checkout [layout.tsx.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/app/layout.tsx.args.mjs) for example
  - [page.tsx.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/app/page.tsx.args.mjs) for example
  - [Header.tsx.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/components/Header.tsx.args.mjs)
  - [ScaffoldEthAppWithProviders.tsx.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/components/ScaffoldEthAppWithProviders.tsx.args.mjs)
  - [getMetadata.ts.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs)
  - [Deploy.s.sol.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/foundry/script/Deploy.s.sol.args.mjs)
- allow skipping local chain in `scaffold.config.ts` checkout [scaffold.config.ts.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/scaffold.config.ts.args.mjs)
- Updated `ScaffoldEthProvider` to add new providers check [ScaffoldEthAppWithProviders.tsx.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/components/ScaffoldEthAppWithProviders.tsx.args.mjs)
- Allow overriding wagmi config in `wagmiConfig.tsx` checkout [wagmiConfig.tsx.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/services/web3/wagmiConfig.tsx.args.mjs)

## 1.0.0-beta.1

### Patch Changes

- eff6cb2: move fastify/deepmerge to main dependency

## 1.0.0-beta.0

### Major Changes

- adjust level of customization and improved ways to pass args to tmeplates, learn more about rules [here](https://github.com/scaffold-eth/create-eth/blob/beta/contributors/TEMPLATING.md#rules-for-template-args)
- updated `scaffold.config.ts.template.mjs` checkout new args example in [scaffold.config.ts.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/scaffold.config.ts.args.mjs)
- updated `hardhat.config.ts.template.mjs` checkout new args example in [hardhat.config.ts.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/hardhat/hardhat.config.ts.args.mjs)
- updated `tailwind.config.js.template.mjs` checkout new args example in [tailwind.config.js.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/tailwind.config.js.args.mjs)
- updated `tsconfig.json.template.mjs` (nextjs / hardhat) checkout new args example in [tsconfig.json.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/tsconfig.json.args.mjs) (nextjs) and [tsconfig.json.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/hardhat/tsconfig.json.args.mjs) (hardhat)
- updated `next.config.ts.template.mjs` checkout new args example in [next.config.ts.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/next.config.ts.args.mjs)
- updated `page.tsx.template.mjs` checkout new args example in [page.tsx.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/packages/nextjs/app/page.tsx.args.mjs) (allowing option for full file override)
- updated `README.md.template.mjs` checkout new args example in [README.md.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/blob/example-beta/extension/README.md.args.mjs)

## 0.2.6

### Patch Changes

- 585715d: add stablecoin challenge to curated extensions

## 0.2.5

### Patch Changes

- up hardhat-deploy allowing etherscan v2 api for verification (https://github.com/scaffold-eth/scaffold-eth-2/pull/1116)
- add not found page (https://github.com/scaffold-eth/scaffold-eth-2/pull/1120)
- add `toBlock` param to useScaffoldEventHistory (https://github.com/scaffold-eth/scaffold-eth-2/pull/1117)
- add `blocksBatchSize` param to useScaffoldEventHistory (https://github.com/scaffold-eth/scaffold-eth-2/pull/1118)
- add check for empty object in getContractsData (https://github.com/scaffold-eth/scaffold-eth-2/pull/1122)
- fix foundry .env.example
- Fetch solidity framework folder correctly for default git branch

## 0.2.4

### Patch Changes

- 4f31b79: up burner-connector version

## 0.2.3

### Patch Changes

- up wagmi, viem and rainbow-me/rainbwkit (https://github.com/scaffold-eth/scaffold-eth-2/pull/1108)
- remove hardcode string and use AddressType (https://github.com/scaffold-eth/scaffold-eth-2/pull/1103)

## 0.2.2

### Patch Changes

- fix dark mode variant (https://github.com/scaffold-eth/scaffold-eth-2/pull/1096)
- Up viem, wagmi and rainbowkit (fixes indexDB warning)(https://github.com/scaffold-eth/scaffold-eth-2/pull/1099)
- Add prediction markets challege to curated extensions

## 0.2.1

### Patch Changes

- 60caf91: - Add chain metadata to `useSelectedNetwork` hook (https://github.com/scaffold-eth/scaffold-eth-2/pull/1093)
  - Add `account:reveal-pk` in foundry (https://github.com/scaffold-eth/scaffold-eth-2/pull/1094)

## 0.2.0

### Minor Changes

- 9776c87: - Tailwind v4 + Daisy v5 migration (https://github.com/scaffold-eth/scaffold-eth-2/pull/1078)
  - remove react-copy-to-clipboard and use native solution (https://github.com/scaffold-eth/scaffold-eth-2/pull/1084)
  - yarn account:reveal-pk (https://github.com/scaffold-eth/scaffold-eth-2/pull/1091)

## 0.1.8

### Patch Changes

- dfcd3b2: fix: remove outdated typescript-eslint/eslint-plugin

## 0.1.7

### Patch Changes

- up burner-connector (https://github.com/scaffold-eth/scaffold-eth-2/pull/1074)
- up next version (https://github.com/scaffold-eth/scaffold-eth-2/pull/1075)
- chore: comments casing in hardhat.config (https://github.com/scaffold-eth/scaffold-eth-2/pull/1080)
- Add a SE-2 cursor project rule (https://github.com/scaffold-eth/scaffold-eth-2/pull/966)
- Migrate to Eslint v9 (https://github.com/scaffold-eth/scaffold-eth-2/pull/1077)
- remove pgn and update polygon networks in hardhat config (https://github.com/scaffold-eth/scaffold-eth-2/pull/1071)

## 0.1.6

### Patch Changes

- NextJs v15 upgrade (https://github.com/scaffold-eth/scaffold-eth-2/pull/1036)
- New foundry deployment workflow (https://github.com/scaffold-eth/scaffold-eth-2/pull/972)
- New RPC config in scaffold.config (https://github.com/scaffold-eth/scaffold-eth-2/pull/1057)
- Fix: import on wagmi package (https://github.com/scaffold-eth/scaffold-eth-2/pull/1061)
- Small tweaks to home page layout (https://github.com/scaffold-eth/scaffold-eth-2/pull/1064)

## 0.1.5

### Patch Changes

- 929b07d: cli: fix foundry nigtly version install command

## 0.1.4

### Patch Changes

- f17ba97: fix husky pre-commit hook not working in generated instance
- f1ac2e8: move template provider after wagmi
- 9336443: templatize manfifest.json checkout [manifest.json.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/tree/example/extension/packages/nextjs/public/manifest.json.args.mjs) args for example

  templatize nextjs tsconfig.json checkout [tsconfig.json.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/tree/example/extension/packages/nextjs/tsconfig.json.args.mjs) args for example

  templatize getMetadata.ts checkout [getMetadata.ts.args.mjs](https://github.com/scaffold-eth/create-eth-extensions/tree/example/extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs)

## 0.1.3

### Patch Changes

- f789c27: - Up wagmi, viem and rainbowkit (https://github.com/scaffold-eth/scaffold-eth-2/pull/1049)
  - Use bgipfs for upload (https://github.com/scaffold-eth/scaffold-eth-2/pull/1039)
  - Update node version requirements (https://github.com/scaffold-eth/scaffold-eth-2/pull/1052)

## 0.1.2

### Patch Changes

- e399485: cli: allow projectName as path while initlializing the cli
- 6318c91: - fix typo in package.json scripts for lint
- Add `hardhat:clean` command to root of monorepo (https://github.com/scaffold-eth/scaffold-eth-2/pull/1043)
- Only render FaucetButton on localhost (https://github.com/scaffold-eth/scaffold-eth-2/pull/1047)
- fix: remove indexed event params (https://github.com/scaffold-eth/scaffold-eth-2/pull/1048)

## 0.1.1

### Patch Changes

- 7e6dc73: - update contract sort order in numberic way (https://github.com/scaffold-eth/scaffold-eth-2/pull/1032)
  - downgrade wagmi and viem version (https://github.com/scaffold-eth/scaffold-eth-2/pull/1038)
- 1572e5a: Add trusted GitHub organizations for extensions
- 13bf6a9: cli: allow capital letter in extension name

## 0.1.0

### Minor Changes

- 6fdbc09: Add SpeedRunEthereum challenges as curated extensions

### Patch Changes

- f983396: templatise `foundry.toml` file
- 4db867d: validate project name inline with npm name rules
- 5d85956: foundry: remove deploy:verify from base package.json
- 36f7a79: - Add contributing rules (https://github.com/scaffold-eth/scaffold-eth-2/pull/1031)
  - Add vercel login script (https://github.com/scaffold-eth/scaffold-eth-2/pull/1027)
- e8c33d8: update readme
- b4dbf8e: cli: allow github url as extension flag

## 0.0.65

### Patch Changes

- 8c4e925: foundry: avoid extra compilation (https://github.com/scaffold-eth/scaffold-eth-2/pull/1020)
- 38d85c0: up burner-connector version (https://github.com/scaffold-eth/scaffold-eth-2/pull/1021)
- aed3345: cli: fix merge package.json files for extensions with both solidity-frameworks

## 0.0.64

### Patch Changes

- Follow root level naming convention (https://github.com/scaffold-eth/scaffold-eth-2/pull/1006)
- Fix useScaffoldEventHistory duplicated events (https://github.com/scaffold-eth/scaffold-eth-2/pull/1014)
- feat: disable vercel telemetry (https://github.com/scaffold-eth/scaffold-eth-2/pull/1012)
- Optional chainId config in Scaffold hooks (https://github.com/scaffold-eth/scaffold-eth-2/pull/931)
- Foundry improvements (https://github.com/scaffold-eth/scaffold-eth-2/pull/1011)
- make `useScaffoldWriteContract` & `useDeployedContractInfo` backward compatible (https://github.com/scaffold-eth/scaffold-eth-2/pull/1015)
- fix: move warnings to useEffect (https://github.com/scaffold-eth/scaffold-eth-2/pull/1016)

## 0.0.63

### Patch Changes

- Optimism and base networks verification (https://github.com/scaffold-eth/scaffold-eth-2/pull/996)
- move 99_deployScript as hardhat task (https://github.com/scaffold-eth/scaffold-eth-2/pull/1005)\*\*
- feat: use current yarn version in vercel on deploy via cli (https://github.com/scaffold-eth/scaffold-eth-2/pull/1007)
- reverse rpc fallback order (https://github.com/scaffold-eth/scaffold-eth-2/pull/1010)
- Encrypt deployer PK on .env file (when using hardhat) (https://github.com/scaffold-eth/scaffold-eth-2/pull/1008 )
- Format package.json files

## 0.0.62

### Patch Changes

- Add Celo to networks (https://github.com/scaffold-eth/scaffold-eth-2/pull/980)
- fix: Input components in form tag (https://github.com/scaffold-eth/scaffold-eth-2/pull/992)
- fix: removed unnecessary logs for decoding tx in block-explorer (https://github.com/scaffold-eth/scaffold-eth-2/pull/985)
- Remove hardcoded colors (https://github.com/scaffold-eth/scaffold-eth-2/pull/991)
- Fix typo in block explorer notification (https://github.com/scaffold-eth/scaffold-eth-2/pull/995)
- Prettier for solidity (https://github.com/scaffold-eth/scaffold-eth-2/pull/994)
- Allow updating global styles & metadatada. Tailwind theme is now an object. (https://github.com/scaffold-eth/create-eth/pull/151)

## 0.0.61

### Patch Changes

- ab052e3: alchemy defaults

## 0.0.60

### Patch Changes

- fix: localStorage -> sessionStorage in debug contracts page (https://github.com/scaffold-eth/scaffold-eth-2/pull/975)
- fix: processing solidity-example template
- skipQuickStart param for README template

## 0.0.59

### Patch Changes

- 5ad5d8e: templates: optional YourContract.sol in extensions
- e950e6f: added nextjs config template
- a444817: - feat: update uniswap deps (https://github.com/scaffold-eth/scaffold-eth-2/pull/956)
  - feat: update envfile (https://github.com/scaffold-eth/scaffold-eth-2/pull/958)
  - Update usehooks-ts, remove use-debounce (https://github.com/scaffold-eth/scaffold-eth-2/pull/957)
  - Update other packages (https://github.com/scaffold-eth/scaffold-eth-2/pull/960)
  - feat: wagmi and viem (https://github.com/scaffold-eth/scaffold-eth-2/pull/971)
  - Update ts, eslint, prettier (https://github.com/scaffold-eth/scaffold-eth-2/pull/963)
  - feat: update husky and lintstaged (https://github.com/scaffold-eth/scaffold-eth-2/pull/959)

## 0.0.58

### Patch Changes

- e9a969d: Template for externalContracts.ts
- 9151c92: template: allow passing metadata & header logoText and description
- ba4e12e: added recommended templating rules
- 2270abb: fix foundry generate script

## 0.0.57

### Patch Changes

- ad4c237: deprecate default alchemy key (scaffold-eth#955)
- b6f0d70: Add template support for solidity compilers

## 0.0.56

### Patch Changes

- foundry: foundry template now uses keystore for deployer account management
- cli: breaking changes to foundry `Deploy.s.sol.template.mjs` file. Please refer to [`Deploy.s.sol.args.mjs`](https://github.com/scaffold-eth/create-eth-extensions/blob/erc-20/extension/packages/foundry/script/Deploy.s.sol.args.mjs) for updated usage.
- extension: eip-5792 extension to curated extension
- Up next react sept 24 (https://github.com/scaffold-eth/scaffold-eth-2/pull/933)
- remove unused type (https://github.com/scaffold-eth/scaffold-eth-2/pull/941)
- Remove nprogress + use next-nprogress-bar (https://github.com/scaffold-eth/scaffold-eth-2/pull/943)
- address component showBoth prop (https://github.com/scaffold-eth/scaffold-eth-2/pull/924)
- Fix rounding issue when converting to wei (https://github.com/scaffold-eth/scaffold-eth-2/pull/940)
- Update hardhat related deps (https://github.com/scaffold-eth/scaffold-eth-2/pull/946)
- make solidity complier as arrays (https://github.com/scaffold-eth/scaffold-eth-2/pull/938)
- chore: up required node to 18.18 (https://github.com/scaffold-eth/scaffold-eth-2/pull/952)

## 0.0.55

### Patch Changes

- fix: different contracts on different chains (https://github.com/scaffold-eth/scaffold-eth-2/pull/920)
- bug: Reset enteredEns on Address input when changing the value (https://github.com/scaffold-eth/scaffold-eth-2/pull/926)
- Up viem, wagmi and rainbowkit (https://github.com/scaffold-eth/scaffold-eth-2/pull/925)
- cli: show yarn install ouput (4bec81e)
- cli: Allow solidity versions and networks + tailwind extend theme (2064f18:)

## 0.0.54

### Patch Changes

- 7d5626f: cli: templatise tailwind and hardhat config
- c74730d: - revert #875 (https://github.com/scaffold-eth/scaffold-eth-2/pull/905)
  - Fix typos (https://github.com/scaffold-eth/scaffold-eth-2/pull/906)
  - Exclude external links from triggering progress bar ([#909](https://github.com/scaffold-eth/scaffold-eth-2/pull/909))
  - Handle tx revert in `useTransactor` (https://github.com/scaffold-eth/scaffold-eth-2/pull/907)
  - show blockexplorer link when transaction is reverted (https://github.com/scaffold-eth/scaffold-eth-2/pull/910)
  - fix: useScaffoldEventHistory caching (https://github.com/scaffold-eth/scaffold-eth-2/pull/916)
  - allow json module imports (https://github.com/scaffold-eth/scaffold-eth-2/pull/921)
- c56aac4: cli: allow case-sensitive extension names

## 0.0.53

### Patch Changes

- fix: vscode eslint not working (https://github.com/scaffold-eth/scaffold-eth-2/pull/905)
- cli: display correct solidity framework options based on extension
- cli: Add curated ERC-20 extension
- cli: fix: copy only chosen solidity framework folder

## 0.0.52

### Patch Changes

- 12ae58d: Add curated Ponder extension
- 6d21542: add onchainkit to curated extension
- 6d21542: feat: template files update

## 0.0.51

### Patch Changes

- fix: BigInt parsing losing precision in IntegerInput (https://github.com/scaffold-eth/scaffold-eth-2/pull/893)
- feat: bundler module resolution (https://github.com/scaffold-eth/scaffold-eth-2/pull/885)
- fix: ignore strings starting with 0 (https://github.com/scaffold-eth/scaffold-eth-2/pull/894)
- cli: don't prompt for install + remove prettier plugins (#80)

## 0.0.50

### Patch Changes

- 5901f51: cli: prettier formatting error

## 0.0.49

### Patch Changes

- 4db51ac: cli: format instance with prettier from cli
- a9545d5: up prettier (scaffold-eth#875)

## 0.0.48

### Patch Changes

- Allow developing externalExtensions with --dev
- remove vercelignore from root dir + clean base package.json
- cli: help command
- foundry: use forge to setup libraries + do early check for foundryup
- foundry: fix verification script failing in latest foundry version
- cli: solidity framework options
- Better transaction result formatting in debug page (#853)
- fix: address components copy icon on small screens (#864)
- lock typescript and abitype version (#871)
- rewrite useScaffoldEventHistory hook (#869)
- fix bug foundry gh action fails

## 0.0.47

### Patch Changes

- Cleanup unused extensions
- Fix listr spamming
- Migrate from husky to lefthook
- Upgrade dependencies
- Templatized foundry deploy script
- Add eip712 curated extension

## 0.0.46

### Patch Changes

- edf9f23: fix: cli immediately exiting after npx create-eth@latest

## 0.0.45

### Patch Changes

- a2c8bab: foundry: fix untracked OZ lib after inital commit
- 2425584: fix: add decimals to native currency price (#854)

  fix: add use effect on Balance component for the price (#856)

  feat: bump burner-connector version (#857)

  feat: useDisplayUsdMode hook (#859)

  feat: up wagmi viem rainbowkit (scaffold-eth#862)

- 8365035: fix foundry gh-actions

## 0.0.44

### Patch Changes

- bec8b09: Bump wagmi, viem and rainbowkit versions (scaffold-eth#849)
- e0c3546: Support for external extensions with -e
- bec8b09: Add default favicon (scaffold-eth#851)

## 0.0.43

### Patch Changes

- 4aba9ad: update useTransactor parameter types (scaffold-eth#846)
- 20b9886: bump burner-connector version

## 0.0.42

### Patch Changes

- AddressInfoModal fix copy icon size on bigger fonts (scaffold-eth#836)
- bump burner-connector version (scaffold-eth#842)
- export useWatchBalance & useTargetNetwork form hooks index file (scaffold-eth#840)
- improve meta handling (scaffold-eth#811)
- fix: useScaffoldWatchContractEvent logs args types (scaffold-eth#837)

## 0.0.41

### Patch Changes

- c46b006: fix dir of TransactionComp in [txHash] page
- c46b006: add engines fields in package.json

## 0.0.40

### Patch Changes

- use burner-connector package
- Update useScaffoldEventHistory hook
- fix: types typo
- add useWatchBalance hook

## 0.0.39

### Patch Changes

- 812e9fc: Add generateStaticParams to blockexplorer address and txHash page

## 0.0.38

### Patch Changes

- c021277: Testing the publishing to npm with new repo

## 0.0.37

### Patch Changes

- Wagmi v2 migration (#700)
- Tailwind dark variant working (#810)
- Gitignored dist folder and updated gitigore files (#804)
- Fixed the main frontend path in README (#808)

## 0.0.36

### Patch Changes

- Extract metadata title and description (#770)
- Remove Goerli from supported networks (#771)
- fix: redundant error notifications on block explorer (#775)
- chore: fix typo (#777)
- fix: vercel deployment linking from github (#780)
- Remove useAccountBalance (#788)
- Templatise README in CLI (#790, #782)
- Add .env to .gitignore in nextjs package (#798)

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

- 9c967d9: 1. Fix RainbowKitCustomConnectButton dropdown styles (#500) 2. chore: footer missalignment & home page on small screens (#502)
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

- 32caee5: 1. Fix RainbowKitCustomConnectButton dropdown styles #500 2. chore: footer missalignment on mobile screens #502
  3. Update and typescript version #499

  4. add grid and grid-flow class to li manually #510

  5. Fix typos in getScaffoldContractWrite lines 57 & 65 #512

  6. fix: test file name #522

  7. add support for `yarn verify --network networkName` in foundry similar to hardhat #489

  8. updated the Git task title from "Initializing Git repository" => "Initializing Git repository and submodules" when the user selects foundry as an extension
