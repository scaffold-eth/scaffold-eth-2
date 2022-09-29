import { Networkish } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { ConnectorData } from "wagmi";
import { BurnerProvider } from "./BurnerProvider";

export type BurnerConnectorOptions = {
  defaultChainId: number;
  //defaultAccount?: string;
};

export type BurnerConnectorData = ConnectorData<BurnerProvider> & {};
