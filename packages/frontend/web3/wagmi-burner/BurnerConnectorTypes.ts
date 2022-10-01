import { Networkish } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { ConnectorData } from "wagmi";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

export type BurnerConnectorOptions = {
  defaultChainId: number;
};

export type BurnerConnectorData = ConnectorData<StaticJsonRpcProvider> & {};
