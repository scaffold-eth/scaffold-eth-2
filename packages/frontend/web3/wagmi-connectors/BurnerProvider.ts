import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { BurnerConnectorOptions } from "./BurnerConnectorTypes";

export class BurnerProvider extends StaticJsonRpcProvider {
  constructor(options: BurnerConnectorOptions) {
    super(options.url, options.network);
  }
}
