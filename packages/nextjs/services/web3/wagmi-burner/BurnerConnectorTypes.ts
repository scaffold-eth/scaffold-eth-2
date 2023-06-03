import { PublicClient } from "viem";
import { ConnectorData } from "wagmi";

export type BurnerConnectorOptions = {
  defaultChainId: number;
};

export type BurnerConnectorData = ConnectorData & {
  provider: PublicClient;
};
