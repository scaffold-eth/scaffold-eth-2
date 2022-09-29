import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { Connector, Chain, ConnectorData, chain } from "wagmi";
import { BurnerConnectorError, BurnerProvider } from "./";
import { BurnerConnectorData, BurnerConnectorOptions, BurnerConnectorErrorList } from "./";

export class BurnerConnector extends Connector<BurnerProvider, BurnerConnectorOptions> {
  readonly id = "coolWallet";
  readonly name = "Cool Wallet";
  readonly ready = true;

  private provider?: BurnerProvider;

  constructor(config: { chains?: Chain[]; options: BurnerConnectorOptions }) {
    super(config);
  }

  async getProvider() {
    if (!this.provider) {
      this.provider = new BurnerProvider(this.options);
    }
    return this.provider;
  }

  // Implement other methods
  // connect, disconnect, getAccount, etc.
  async connect(config?: { chainId?: number | undefined } | undefined): Promise<Required<BurnerConnectorData>> {
    this.provider = new StaticJsonRpcProvider(this.options.url, this.options.network);
    const account = await this.getAccount(this.options.accountId);
    const chainId = await this.getChainId();

    if (this.provider == null || account == null || chainId == null) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.couldNotConnect);
    }

    // todo unsported chains
    if (config?.chainId !== chainId) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.accountNotFound);
    }

    const data: Required<BurnerConnectorData> = {
      account,
      chain: {
        id: chainId,
        unsupported: false,
      },
      provider: this.provider,
    };

    return data;
  }
  disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getAccount(id?: number): Promise<string> {
    const accounts = await this.provider?.listAccounts();
    if (accounts == null || accounts[0] == null || (id != null && accounts[id] == null)) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.accountNotFound);
    }

    const account = id ? accounts[id] : accounts[0];

    return account;
  }
  getChainId(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  getSigner(config?: { chainId?: number | undefined } | undefined): Promise<any> {
    throw new Error("Method not implemented.");
  }
  isAuthorized(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  protected onAccountsChanged(accounts: string[]): void {
    throw new Error("Method not implemented.");
  }
  protected onChainChanged(chain: string | number): void {
    throw new Error("Method not implemented.");
  }
  protected onDisconnect(error: Error): void {
    throw new Error("Method not implemented.");
  }
}
