import { WalletDetailsParams } from "@rainbow-me/rainbowkit";
import { createConnector, normalizeChainId } from "@wagmi/core";
import {
  EIP1193RequestFn,
  Hex,
  RpcRequestError,
  SwitchChainError,
  Transport,
  WalletRpcSchema,
  createWalletClient,
  custom,
  fromHex,
  getAddress,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getHttpRpcClient, hexToBigInt, numberToHex } from "viem/utils";
import { SendTransactionParameters } from "viem/zksync";
import { BaseError } from "wagmi";
import { loadBurnerSK } from "~~/hooks/scaffold-eth";

export const burnerWalletId = "burnerWallet";
export const burnerWalletName = "Burner Wallet";

export class ConnectorNotConnectedError extends BaseError {
  override name = "ConnectorNotConnectedError";
  constructor() {
    super("Connector not connected.");
  }
}

export class ChainNotConfiguredError extends BaseError {
  override name = "ChainNotConfiguredError";
  constructor() {
    super("Chain not configured.");
  }
}

type Provider = ReturnType<Transport<"custom", Record<any, any>, EIP1193RequestFn<WalletRpcSchema>>>;

export const createBurnerConnector = (walletDetails: WalletDetailsParams) => {
  let connected = true;
  let connectedChainId: number;
  return createConnector<Provider>(config => ({
    id: burnerWalletId,
    name: burnerWalletName,
    type: "burnerWallet",
    async connect({ chainId } = {}) {
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: "eth_accounts",
      });
      let currentChainId = await this.getChainId();
      if (chainId && currentChainId !== chainId && this.switchChain) {
        const chain = await this.switchChain({ chainId });
        currentChainId = chain.id;
      }
      connected = true;
      return { accounts, chainId: currentChainId };
    },
    async getProvider({ chainId } = {}) {
      const chain = config.chains.find(x => x.id === chainId) ?? config.chains[0];

      const url = chain.rpcUrls.default.http[0];
      const burnerAccount = privateKeyToAccount(loadBurnerSK());
      const client = createWalletClient({
        chain: chain,
        account: burnerAccount,
        transport: http(),
      });

      const request: EIP1193RequestFn = async ({ method, params }) => {
        if (method === "eth_sendTransaction") {
          const actualParams = (params as SendTransactionParameters[])[0];
          const value = actualParams.value ? hexToBigInt(actualParams.value as unknown as Hex) : undefined;
          const hash = await client.sendTransaction({
            ...(params as SendTransactionParameters[])[0],
            value,
          });
          return hash;
        }

        if (method === "eth_accounts") {
          return [burnerAccount.address];
        }

        if (method === "wallet_switchEthereumChain") {
          type Params = [{ chainId: Hex }];
          connectedChainId = fromHex((params as Params)[0].chainId, "number");
          this.onChainChanged(connectedChainId.toString());
          return;
        }

        const body = { method, params };
        const httpClient = getHttpRpcClient(url);
        const { error, result } = await httpClient.request({ body });
        if (error) throw new RpcRequestError({ body, error, url });

        return result;
      };

      return custom({ request })({ retryCount: 0 });
    },
    onChainChanged(chain) {
      const chainId = normalizeChainId(chain);
      config.emitter.emit("change", { chainId });
    },
    async getAccounts() {
      if (!connected) throw new ConnectorNotConnectedError();
      const provider = await this.getProvider();
      const accounts = await provider.request({ method: "eth_accounts" });
      return [accounts.map(x => getAddress(x))[0]];
    },
    async onDisconnect() {
      config.emitter.emit("disconnect");
      connected = false;
    },
    async getChainId() {
      const provider = await this.getProvider();
      const hexChainId = await provider.request({ method: "eth_chainId" });
      return fromHex(hexChainId, "number");
    },
    async isAuthorized() {
      if (!connected) return false;
      const accounts = await this.getAccounts();
      return !!accounts.length;
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit("change", {
          accounts: accounts.map(x => getAddress(x)),
        });
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      const chain = config.chains.find(x => x.id === chainId);
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: numberToHex(chainId) }],
      });
      return chain;
    },
    disconnect() {
      console.log("disconnect from burnerwallet");
      connected = false;
      return Promise.resolve();
    },
    ...walletDetails,
  }));
};
