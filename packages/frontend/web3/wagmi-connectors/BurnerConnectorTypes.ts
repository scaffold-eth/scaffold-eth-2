import { Networkish } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { ConnectorData } from "wagmi";
import { BurnerProvider } from "./BurnerProvider";

export type BurnerConnectorOptions = {
  /** Name of connector */
  name?: string | ((detectedName: string | string[]) => string);
  url?: ConnectionInfo | string;
  network?: Networkish;
  accountId?: number;
};

export type BurnerConnectorData = ConnectorData<BurnerProvider> & {};
