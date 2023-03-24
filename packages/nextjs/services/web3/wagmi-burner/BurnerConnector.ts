import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "ethers";
import { Chain, Connector } from "wagmi";
import { loadBurnerSK } from "~~/hooks/scaffold-eth";
import { BurnerConnectorError, BurnerConnectorErrorList } from "~~/services/web3/wagmi-burner/BurnerConnectorErrors";
import { BurnerConnectorData, BurnerConnectorOptions } from "~~/services/web3/wagmi-burner/BurnerConnectorTypes";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

export const burnerWalletId = "burner-wallet";
export const burnerWalletName = "Burner Wallet";
export const defaultBurnerChainId = getTargetNetwork().id;

/**
 * This class is a wagmi connector for BurnerWallet.  Its used by {@link burnerWalletConfig}
 */
export class BurnerConnector extends Connector<StaticJsonRpcProvider, BurnerConnectorOptions> {
  readonly id = burnerWalletId;
  readonly name = burnerWalletName;
  readonly ready = true;

  private provider?: StaticJsonRpcProvider;
  /**
   * this is the store for getWallet()
   */
  private burnerWallet: Wallet | undefined;

  constructor(config: { chains?: Chain[]; options: BurnerConnectorOptions }) {
    super(config);
    this.burnerWallet = undefined;
  }

  async getProvider() {
    if (!this.provider) {
      const chain = this.getChainFromId();
      this.provider = new StaticJsonRpcProvider(chain.rpcUrls.default.http[0]);
    }
    return this.provider;
  }

  async connect(config?: { chainId?: number | undefined } | undefined): Promise<Required<BurnerConnectorData>> {
    const chain = this.getChainFromId(config?.chainId);

    this.provider = new StaticJsonRpcProvider(chain.rpcUrls.default.http[0]);
    const account = await this.getAccount();

    if (this.provider == null || account == null) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.couldNotConnect);
    }

    if (!account) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.accountNotFound);
    }

    const data: Required<BurnerConnectorData> = {
      account,
      chain: {
        id: chain.id,
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
    const wallet = this.getWallet();
    const account = wallet.address;
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
    const signer = this.getWallet();

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

  private getWallet(): Wallet {
    if (this.burnerWallet == null) {
      this.burnerWallet = new Wallet(loadBurnerSK(), this.provider);
    }
    return this.burnerWallet;
  }

  protected onAccountsChanged(): void {
    this.burnerWallet = new Wallet(loadBurnerSK(), this.provider);
  }
  protected onChainChanged(): void {
    this.burnerWallet = new Wallet(loadBurnerSK(), this.provider);
  }
  protected onDisconnect(error: Error): void {
    if (error) console.warn(error);
  }
}
