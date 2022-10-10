import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { Connector, Chain, chain } from "wagmi";
import { loadBurnerWallet } from "~~/components/hooks/useBurnerWallet";
import { BurnerConnectorError } from ".";
import { BurnerConnectorData, BurnerConnectorOptions, BurnerConnectorErrorList } from ".";

export const burnerWalletId = "burner-wallet";
export const burnerWalletName = "Burner Wallet";
export const defaultBurnerChainId = chain.hardhat.id;

/**
 * This class is a wagmi connector for BurnerWallet.  Its used by {@link burnerWalletConfig}
 */
export class BurnerConnector extends Connector<StaticJsonRpcProvider, BurnerConnectorOptions> {
  readonly id = burnerWalletId;
  readonly name = burnerWalletName;
  readonly ready = true;

  private provider?: StaticJsonRpcProvider;

  constructor(config: { chains?: Chain[]; options: BurnerConnectorOptions }) {
    super(config);
  }

  async getProvider() {
    if (!this.provider) {
      const chain = this.getChainFromId();
      this.provider = new StaticJsonRpcProvider(chain.rpcUrls.default);
    }
    return this.provider;
  }

  // Implement other methods
  // connect, disconnect, getAccount, etc.
  async connect(config?: { chainId?: number | undefined } | undefined): Promise<Required<BurnerConnectorData>> {
    const chain = this.getChainFromId(config?.chainId);

    this.provider = new StaticJsonRpcProvider(chain.rpcUrls.default);
    const account = await this.getAccount();
    const chainId = await this.getChainId();

    if (this.provider == null || account == null || chainId == null) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.couldNotConnect);
    }

    // todo unsported chains?? should i populate unsupported param

    if (!account) {
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
  private getChainFromId(chainId?: number) {
    const resolveChainId = chainId ?? this.options.defaultChainId;
    const chain = this.chains.find(f => f.id === resolveChainId);
    if (chain == null) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.chainNotSupported);
    }
    return chain;
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

    const wallet = loadBurnerWallet();
    const account = wallet.address ?? accounts[0];
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

  async getSigner(): Promise<any> {
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

  protected onAccountsChanged(): void {
    throw new Error("Method not implemented.");
  }
  protected onChainChanged(): void {
    throw new Error("Method not implemented.");
  }
  protected onDisconnect(error: Error): void {
    if (error) console.warn(error);
  }
}
