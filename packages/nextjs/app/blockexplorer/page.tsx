"use client";

import { BlockExplorer } from "@scaffold-ui/block-explorer";
import deployedContracts from "~~/contracts/deployedContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export default function BlockExplorerPage() {
  const { targetNetwork } = useTargetNetwork();
  return <BlockExplorer targetNetwork={targetNetwork} deployedContracts={deployedContracts} />;
}
