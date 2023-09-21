import { Metadata } from "next";
import { getMetaData } from "~~/utils/scaffold-eth/getMetaData";

export const metadata: Metadata = getMetaData({
  title: "Block Explorer",
  description: "Block Explorer created with 🏗 Scaffold-ETH 2",
});

const BlockExplorerLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default BlockExplorerLayout;
