# 项目整理与快速上手（中文）

本文件为本仓库（Scaffold-ETH 2 派生项目）的中文整理文档，旨在帮助开发者快速理解项目结构、常用命令与开发/部署流程。

## 一、项目概览

- 本仓库基于 Scaffold-ETH 2，包含两种 Solidity 开发风格：Hardhat（packages/hardhat）或 Foundry（packages/foundry）。二者只会出现其一。
- 前端统一为 packages/nextjs（Next.js + TypeScript + Wagmi/Viem + DaisyUI）。
- 仓库内还有 agent/skills 指南（AGENTS.md）用于自动化或工具集成的约定。

## 二、如何识别当前风格（Hardhat / Foundry）

- 若存在 `packages/hardhat` 目录 → Hardhat 风格（使用 hardhat-deploy）
- 若存在 `packages/foundry` 目录 → Foundry 风格（使用 Forge / Anvil）

## 三、常用开发命令（在仓库根目录）

- yarn chain          # 启动本地链（Hardhat node 或 Anvil）
- yarn deploy         # 将合约部署到本地链（或通过 --network 指定网络）
- yarn start          # 启动前端（Next.js）: http://localhost:3000
- yarn compile        # 编译智能合约
- yarn test           # 运行测试（按 flavor 在各自 package 中运行）
- yarn lint / yarn format

注：Windows 环境请在 PowerShell/CMD 中执行命令，并确保 Node/Yarn 环境可用。

## 四、代码目录（高层次）

- packages/hardhat         -> 智能合约（Hardhat flavor）
- packages/foundry         -> 智能合约（Foundry flavor）
- packages/nextjs          -> 前端 React/Next.js 应用（共享）
- packages/nextjs/contracts -> 部署后生成的 deployedContracts.ts（ABI/合约地址）
- AGENTS.md / CLAUDE.md    -> 仓库内给 agent 的工作指导（仅供自动化/审阅使用）

## 五、智能合约开发要点

- Hardhat: 合约位于 packages/hardhat/contracts，部署脚本在 packages/hardhat/deploy/。使用 hardhat-deploy 的 tag/脚本机制来部署特定合约。
  - 注意：部署脚本中若在部署后进行额外管理调用（transferOwnership、grantRole、initialize 等），可能继承区块 gas limit，建议在这些调用处显式设置 gasLimit（或估算并加 20% 余量）。

- Foundry: 合约位于 packages/foundry/contracts，部署脚本在 packages/foundry/script/，使用 Forge 脚本部署。

## 六、前端合约交互（重要约定）

本项目约定并提供便捷 hooks：

- useScaffoldReadContract（用于只读）
- useScaffoldWriteContract（用于发起写操作）
- useScaffoldEventHistory / useScaffoldWatchContractEvent（用于事件历史与监听）

示例（伪代码）：

const { data } = useScaffoldReadContract({ contractName: 'YourContract', functionName: 'someView' });

const { writeContractAsync } = useScaffoldWriteContract({ contractName: 'YourContract' });
await writeContractAsync({ functionName: 'set', args: [val], value: parseEther('0.01') });

## 七、本地开发流程（快速）

1. 安装依赖：在仓库根或各 packages 目录执行 yarn（视情况而定）。
2. 启动本地链：yarn chain
3. 部署合约（本地）：yarn deploy
4. 启动前端：yarn start

## 八、部署到测试网/主网

- 添加网络配置：Hardhat 在 packages/hardhat/hardhat.config.ts；Foundry 在 packages/foundry/foundry.toml；前端网络配置在 packages/nextjs/scaffold.config.ts。
- 使用 yarn deploy --network <network> 部署到远程网络。
- 合约验证：yarn verify --network <network>

## 九、提交与分支建议

- 当前会话用分支名（kebab-case）组织改动；示例分支名：organize-project-docs
- 提交信息保持清晰、分步（例如："docs: add PROJECT_DOCS_CN.md"）。

## 十、贡献与维护提示

- 遵循仓库中的代码风格（TypeScript 类型、UpperCamelCase/ lowerCamelCase 约定）。
- 修改部署脚本时，若包含后置 on-chain admin 调用，显式设置 gasLimit 或使用 estimateGas。
- 在更改前端合约交互 hook 时，先阅读 packages/nextjs/hooks/scaffold-eth 的实现以保持兼容。

## 十一、资源与联系

- AGENTS.md（仓库内）包含给自动化 agent 的详细指引，适合查阅项目规范与约定。
- 如需我把此文档搬到 docs/ 子目录或生成中文版更详细的 README，请回复说明要放置的位置或额外需求。

---

文件由会话 “整理项目文档” 生成，分支: vvv202210171-organize-project-docs。若需将其合并为 README 或加入 docs/，可继续指示。