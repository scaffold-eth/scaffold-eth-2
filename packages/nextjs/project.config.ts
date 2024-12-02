import { BuidlGuidlLogo } from "./components/assets/BuidlGuidlLogo";

export type ProjectConfig = {
  name: string;
  description: string;
  nameHeader: string;
  descriptionHeader: string;
  iconPathHeader: string;
  creator: string;
  creatorSvg: any;
  creatorLink: string;
  repoLink: string;
  supportLink: string;
};

const projectConfig = {
  nameHeader: "Scaffold-ETH",
  descriptionHeader: "Ethereum dev stack",
  iconPathHeader: "/logo.svg",
  name: "Scaffold-ETH 2",
  description: "Built with 🏗 Scaffold-ETH 2",
  creator: "BuidlGuidl",
  creatorSvg: BuidlGuidlLogo,
  creatorLink: "https://buidlguidl.com/",
  repoLink: "https://github.com/scaffold-eth/se-2",
  supportLink: "https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA",
} as const satisfies ProjectConfig;

export default projectConfig;
