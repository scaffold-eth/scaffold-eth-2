import { HttpTransport, PrivateKeyAccount, WalletClient, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Chain, Connector, PublicClient } from "wagmi";
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
export class BurnerConnector extends Connector<PublicClient, BurnerConnectorOptions> {
  readonly id = burnerWalletId;
  readonly name = burnerWalletName;
  readonly ready = true;

  private provider?: PublicClient;
  /**
   * this is the store for getWallet()
   */
  private burnerWallet: WalletClient<HttpTransport, Chain, PrivateKeyAccount> | undefined;

  constructor(config: { chains?: Chain[]; options: BurnerConnectorOptions }) {
    super(config);
    this.burnerWallet = undefined;
  }

  async getProvider() {
    if (!this.provider) {
      const chain = this.getChainFromId();
      this.provider = createPublicClient({
        chain,
        transport: http(),
      });
    }
    return this.provider;
  }

  async getWalletClient(config?: { chainId?: number | undefined } | undefined) {
    const chain = this.getChainFromId(config?.chainId);
    if (!this.burnerWallet) {
      const bunerAccount = privateKeyToAccount(loadBurnerSK());

      const client = createWalletClient({
        chain: chain ?? this.provider?.chain,
        account: bunerAccount,
        transport: http(),
      });
      this.burnerWallet = client;
    }
    return Promise.resolve(this.burnerWallet);
  }

  async connect(config?: { chainId?: number | undefined } | undefined): Promise<Required<BurnerConnectorData>> {
    const chain = this.getChainFromId(config?.chainId);

    this.provider = createPublicClient({
      chain,
      transport: http(),
    });
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

    return Promise.resolve(data);
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

  async getAccount(): Promise<`0x${string}`> {
    const bunerAccount = privateKeyToAccount(loadBurnerSK());
    return bunerAccount.address as `0x${string}`;
  }

  async getChainId(): Promise<number> {
    const network = this.provider?.chain;
    const chainId = network?.id ?? this.options.defaultChainId;
    if (chainId == null) {
      throw new BurnerConnectorError(BurnerConnectorErrorList.chainIdNotResolved);
    }

    return Promise.resolve(chainId);
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
    const bunerAccount = privateKeyToAccount(loadBurnerSK());

    const client = createWalletClient({
      chain: this.provider?.chain,
      account: bunerAccount,
      transport: http(),
    });
    this.burnerWallet = client;
  }
  protected onChainChanged(): void {
    const bunerAccount = privateKeyToAccount(loadBurnerSK());

    const client = createWalletClient({
      chain: this.provider?.chain,
      account: bunerAccount,
      transport: http(),
    });
    this.burnerWallet = client;
  }
  protected onDisconnect(error: Error): void {
    if (error) console.warn(error);
  }
}
