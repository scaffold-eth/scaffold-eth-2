import { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CHAIN_NAMESPACES, SafeEventEmitterProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter, OpenloginUserInfo } from "@web3auth/openlogin-adapter";
// import { useAccount, useConnect, useDisconnect, useSwitchNetwork } from "wagmi";
import { ArrowLeftOnRectangleIcon, ArrowsRightLeftIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { Balance, BlockieAvatar } from "~~/components/scaffold-eth";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import RPC from "~~/services/web3/ethersRPC";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const clientId = "BEglQSgt4cUWcj6SKRdu5QkOXTsePmMcusG5EAoyjyOYKlVRjIF1iCNnMOTfpzCiunHRrMui8TIwQPXdkQ8Yxuk"; // get from https://dashboard.web3auth.io

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const Web3AuthLoginButton = () => {
  const networkColor = useNetworkColor();
  const configuredNetwork = getTargetNetwork();
  // const { connector } = useAccount();
  // const { connect, connectors, error } = useConnect();
  // const { disconnect } = useDisconnect();
  // const { switchNetwork } = useSwitchNetwork();

  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [chainName, setChainName] = useState<string | undefined>(undefined);
  const [userInfo, setUserInfo] = useState<Partial<OpenloginUserInfo> | null>(null);
  const [address, setAddress] = useState<string | undefined>(undefined);
  // const [balance, setBalance] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x" + configuredNetwork.id.toString(16),
            rpcTarget: configuredNetwork.rpcUrls.default.http[0],
          },
          uiConfig: {
            appName: "W3A Heroes",
            appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg", // Your App Logo Here
            theme: "light",
            // loginMethodsOrder: ["apple", "google", "twitter"],
            defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
            loginGridCol: 3,
            primaryButton: "externalLogin", // "externalLogin" | "socialLogin" | "emailLogin"
          },
          web3AuthNetwork: "cyan",
        });

        const openloginAdapter = new OpenloginAdapter({
          loginSettings: {
            mfaLevel: "optional",
          },
          adapterSettings: {
            whiteLabel: {
              name: "W3A Heroes",
              logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
              defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
              dark: false, // whether to enable dark mode. defaultValue: false
            },
            mfaSettings: {
              deviceShareFactor: {
                enable: true,
                priority: 1,
                mandatory: true,
              },
              backUpShareFactor: {
                enable: true,
                priority: 2,
                mandatory: false,
              },
              socialBackupFactor: {
                enable: true,
                priority: 3,
                mandatory: false,
              },
              passwordFactor: {
                enable: true,
                priority: 4,
                mandatory: false,
              },
            },
            loginConfig: {
              google: {
                verifier: "web3auth-google-example",
                typeOfLogin: "google",
                clientId: "774338308167-q463s7kpvja16l4l0kko3nb925ikds2p.apps.googleusercontent.com", //use your app client id you got from google
              },
              facebook: {
                verifier: "web3auth-facebook-example",
                typeOfLogin: "facebook",
                clientId: "1222658941886084", //use your app client id you got from facebook
              },
              discord: {
                verifier: "web3auth-discord-example",
                typeOfLogin: "discord",
                clientId: "993506120276648017", //use your app client id you got from discord
              },
              twitch: {
                verifier: "web3auth-twitch-example",
                typeOfLogin: "twitch",
                clientId: "csotztipy7zn1bk9x4973bht1d8b0u", //use your app client id you got from twitch
              },
            },
          },
        });
        web3auth.configureAdapter(openloginAdapter);

        setWeb3auth(web3auth);

        // await web3auth.initModal();

        await web3auth.initModal({
          modalConfig: {
            [WALLET_ADAPTERS.OPENLOGIN]: {
              loginMethods: {
                google: {
                  name: "google login",
                },
                facebook: {
                  // it will hide the facebook option from the Web3Auth modal.
                  name: "facebook login",
                },
              },
            },
          } as any,
        });
        setProvider(web3auth.provider);
        await switchChain(configuredNetwork.id);
        await getChainId();
        await getChainName();

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const getBal = async () => {
      await getBalance();
    };
    getBal();
  });

  const login = async () => {
    if (!web3auth) {
      return;
    }
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
      await switchChain(configuredNetwork.id);
      await getUserInfo();
      await getAccounts();
      await getBalance();
      await getChainId();
      await getChainName();
    } catch (error) {
      console.error(error);
    }
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      return;
    }
    const user = await web3auth.getUserInfo();
    setUserInfo(user);
  };

  const logout = async () => {
    if (!web3auth) {
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
  };

  const getChainId = async () => {
    if (!provider) {
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    setChainId(chainId);
  };

  const getChainName = async () => {
    if (!provider) {
      return;
    }
    const rpc = new RPC(provider);
    const chainName = await rpc.getChainName();
    setChainName(chainName);
  };

  const switchChain = async (id: number) => {
    console.log(id);
    if (!provider) {
      return;
    }
    await web3auth?.switchChain({ chainId: "0x" + id.toString(16) });
    setChainId(id);
    await getUserInfo();
    await getAccounts();
    await getBalance();
  };

  const getAccounts = async () => {
    if (!provider) {
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    setAddress(address);
  };

  const getBalance = async () => {
    if (!provider) {
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    console.log(balance);
    // setBalance(balance);
  };

  return (
    <>
      {(() => {
        if (!loggedIn) {
          return (
            <button className="btn btn-primary btn-sm" style={{ margin: "0 1pt" }} onClick={login} type="button">
              Log In
            </button>
          );
        }

        if (chainId !== configuredNetwork.id) {
          return (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-error btn-sm dropdown-toggle">
                <span>Wrong network</span>
                <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 mt-1 shadow-lg bg-base-100 rounded-box">
                <li>
                  <button className="menu-item" type="button" onClick={() => switchChain(configuredNetwork.id)}>
                    <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />
                    <span className="whitespace-nowrap">
                      Switch to <span style={{ color: networkColor }}>{configuredNetwork.name}</span>
                    </span>
                  </button>
                </li>
                <li>
                  <button className="menu-item text-error" type="button" onClick={() => logout()}>
                    <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Disconnect</span>
                  </button>
                </li>
              </ul>
            </div>
          );
        }

        return (
          <div className="px-2 flex justify-end items-center">
            <div className="flex justify-center items-center border-1 rounded-lg">
              <div className="flex flex-col items-center mr-1">
                <button onClick={getBalance}>
                  <Balance address={address} className="min-h-0 h-auto" />
                  <span className="text-xs" style={{ color: networkColor }}>
                    {chainName}
                  </span>
                </button>
              </div>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-secondary btn-sm pl-0 pr-2 shadow-md">
                  <BlockieAvatar address={address ? address : ""} size={24} />
                  <span>{userInfo ? userInfo.email : address}</span>
                  <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 mt-1 shadow-lg bg-base-100 rounded-box">
                  <li>
                    <button className="menu-item text-primary" type="button" onClick={() => logout()}>
                      <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Log Out</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};
