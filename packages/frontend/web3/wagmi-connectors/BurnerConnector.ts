import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { Connector, Chain, ConnectorData, chain } from "wagmi";
import { BurnerConnectorError, BurnerProvider } from "./";
import { BurnerConnectorData, BurnerConnectorOptions, BurnerConnectorErrorList } from "./";

export class BurnerConnector extends Connector<BurnerProvider, BurnerConnectorOptions> {
  readonly id = "burnerWallet";
  readonly name = "Burner Wallet";
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
    console.log("connect;");
    console.log(this.chains, config, this.options);

    const chain = this.chains.find((f) => f.id === config?.chainId);
    console.log(chain);

    if (chain == null) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.chainNotSupported);
    }

    this.provider = new StaticJsonRpcProvider(chain.rpcUrls.default);
    const account = await this.getAccount();
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
    console.log("disconnect from burnerwallet");
    return Promise.resolve();
  }

  async getAccount(): Promise<string> {
    const accounts = await this.provider?.listAccounts();
    if (accounts == null || accounts[0] == null) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.accountNotFound);
    }

    const account = accounts[0];
    return account;
  }

  async getChainId(): Promise<number> {
    const network = await this.provider?.getNetwork();
    const chainId = network?.chainId ?? this.options.defaultChainId;
    if (chainId == null) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.chainIdNotResolved);
    }

    return Promise.resolve(chainId);
  }

  async getSigner(config?: { chainId?: number | undefined } | undefined): Promise<any> {
    const account = await this.getAccount();
    const signer = this.provider?.getSigner(account);

    if (signer == null || (await signer.getAddress()) !== account) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.signerNotResolved);
    }

    return Promise.resolve(signer);
  }
  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  protected onAccountsChanged(accounts: string[]): void {
    throw new Error("Method not implemented.");
  }
  protected onChainChanged(chain: string | number): void {
    throw new Error("Method not implemented.");
  }
  protected onDisconnect(error: Error): void {
    if (error) console.warn(error);
  }
}
