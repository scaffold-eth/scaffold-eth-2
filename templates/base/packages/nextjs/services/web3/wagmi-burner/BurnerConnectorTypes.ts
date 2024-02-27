import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { ConnectorData } from "wagmi";

export type BurnerConnectorOptions = {
  defaultChainId: number;
};

export type BurnerConnectorData = ConnectorData & {
  provider: StaticJsonRpcProvider;
};
