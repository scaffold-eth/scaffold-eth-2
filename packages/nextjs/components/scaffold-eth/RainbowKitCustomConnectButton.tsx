import { useRef, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { QRCodeSVG } from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useDarkMode } from "usehooks-ts";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { Address, Balance, BlockieAvatar } from "~~/components/scaffold-eth";
import { getNetworkColor, useAutoConnect, useNetworkColor, useOutsideClick } from "~~/hooks/scaffold-eth";
import { getBlockExplorerAddressLink, getTargetNetworks, useTargetNetwork } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  useAutoConnect();
  const { isDarkMode } = useDarkMode();
  const networkColor = useNetworkColor();
  const configuredNetwork = useTargetNetwork();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();
  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(configuredNetwork, account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== configuredNetwork.id) {
                return (
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-error btn-sm dropdown-toggle gap-1">
                      <span>Wrong network</span>
                      <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 mt-1 shadow-center shadow-accent bg-base-200 rounded-box gap-1"
                    >
                      {allowedNetworks.map(network => (
                        <li key={network.id}>
                          <button
                            className="menu-item btn-sm !rounded-xl flex gap-3 py-3 whitespace-nowrap"
                            type="button"
                            onClick={() => {
                              switchNetwork?.(network.id);
                            }}
                          >
                            <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> Switch to{" "}
                            <span
                              style={{
                                color: getNetworkColor(network, isDarkMode),
                              }}
                            >
                              {network.name}
                            </span>
                          </button>
                        </li>
                      ))}
                      <li>
                        <button
                          className="menu-item text-error btn-sm !rounded-xl flex gap-3 py-3"
                          type="button"
                          onClick={() => disconnect()}
                        >
                          <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Disconnect</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                );
              }

              return (
                <div className="px-2 flex justify-end items-center">
                  <div className="flex flex-col items-center mr-1">
                    <Balance address={account.address} className="min-h-0 h-auto" />
                    <span className="text-xs" style={{ color: networkColor }}>
                      {chain.name}
                    </span>
                  </div>
                  <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
                    <summary
                      tabIndex={0}
                      className="btn btn-secondary btn-sm pl-0 pr-2 shadow-md dropdown-toggle gap-0 !h-auto"
                    >
                      <BlockieAvatar address={account.address} size={30} ensImage={account.ensAvatar} />
                      <span className="ml-2 mr-1">{account.displayName}</span>
                      <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
                    </summary>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu z-[2] p-2 mt-2 shadow-center shadow-accent bg-base-200 rounded-box gap-1"
                    >
                      {allowedNetworks
                        .filter(network => network.id !== configuredNetwork.id)
                        .map(network => (
                          <li key={network.id} className={selectingNetwork ? "" : "hidden"}>
                            <button
                              className="menu-item btn-sm !rounded-xl flex gap-3 py-3 whitespace-nowrap"
                              type="button"
                              onClick={() => {
                                closeDropdown();
                                setSelectingNetwork(false);
                                switchNetwork?.(network.id);
                              }}
                            >
                              <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> Switch to{" "}
                              <span
                                style={{
                                  color: getNetworkColor(network, isDarkMode),
                                }}
                              >
                                {network.name}
                              </span>
                            </button>
                          </li>
                        ))}
                      <li className={selectingNetwork ? "hidden" : ""}>
                        {addressCopied ? (
                          <div className="btn-sm !rounded-xl flex gap-3 py-3">
                            <CheckCircleIcon
                              className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                              aria-hidden="true"
                            />
                            <span className=" whitespace-nowrap">Copy address</span>
                          </div>
                        ) : (
                          <CopyToClipboard
                            text={account.address}
                            onCopy={() => {
                              setAddressCopied(true);
                              setTimeout(() => {
                                setAddressCopied(false);
                                closeDropdown();
                              }, 800);
                            }}
                          >
                            <div className="btn-sm !rounded-xl flex gap-3 py-3">
                              <DocumentDuplicateIcon
                                className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                                aria-hidden="true"
                              />
                              <span className=" whitespace-nowrap">Copy address</span>
                            </div>
                          </CopyToClipboard>
                        )}
                      </li>
                      <li className={selectingNetwork ? "hidden" : ""}>
                        <label
                          htmlFor="qrcode-modal"
                          className="btn-sm !rounded-xl flex gap-3 py-3"
                          onClick={closeDropdown}
                        >
                          <QrCodeIcon className="h-6 w-4 ml-2 sm:ml-0" />
                          <span className="whitespace-nowrap">View QR Code</span>
                        </label>
                      </li>
                      <li className={selectingNetwork ? "hidden" : ""}>
                        <button className="menu-item btn-sm !rounded-xl flex gap-3 py-3" type="button">
                          <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" />
                          <a
                            target="_blank"
                            href={blockExplorerAddressLink}
                            rel="noopener noreferrer"
                            className="whitespace-nowrap"
                          >
                            View on Block Explorer
                          </a>
                        </button>
                      </li>
                      {allowedNetworks.length > 1 ? (
                        <li className={selectingNetwork ? "hidden" : ""}>
                          <button
                            className="btn-sm !rounded-xl flex gap-3 py-3"
                            type="button"
                            onClick={() => {
                              setSelectingNetwork(true);
                            }}
                          >
                            <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Switch Network</span>
                          </button>
                        </li>
                      ) : null}
                      <li className={selectingNetwork ? "hidden" : ""}>
                        <button
                          className="menu-item text-error btn-sm !rounded-xl flex gap-3 py-3"
                          type="button"
                          onClick={() => disconnect()}
                        >
                          <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Disconnect</span>
                        </button>
                      </li>
                    </ul>
                  </details>
                  <div>
                    <input type="checkbox" id="qrcode-modal" className="modal-toggle" />
                    <label htmlFor="qrcode-modal" className="modal cursor-pointer">
                      <label className="modal-box relative">
                        {/* dummy input to capture event onclick on modal box */}
                        <input className="h-0 w-0 absolute top-0 left-0" />
                        <label
                          htmlFor="qrcode-modal"
                          className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
                        >
                          ✕
                        </label>
                        <div className="space-y-3 py-6">
                          <div className="flex space-x-4 flex-col items-center gap-6">
                            <QRCodeSVG value={account.address} size={256} />
                            <Address address={account.address} format="long" disableAddressLink />
                          </div>
                        </div>
                      </label>
                    </label>
                  </div>
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
