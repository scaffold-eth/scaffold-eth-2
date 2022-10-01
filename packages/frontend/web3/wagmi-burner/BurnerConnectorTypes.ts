import { ConnectorData } from "wagmi";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

export type BurnerConnectorOptions = {
  defaultChainId: number;
};

export type BurnerConnectorData = ConnectorData<StaticJsonRpcProvider> & {};
