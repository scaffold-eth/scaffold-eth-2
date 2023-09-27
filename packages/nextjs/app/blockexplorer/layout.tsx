import { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "Block Explorer",
  description: "Block Explorer created with 🏗 Scaffold-ETH 2",
});

const BlockExplorerLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default BlockExplorerLayout;
