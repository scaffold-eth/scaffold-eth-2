import { useEffect, useRef, useState } from "react";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import { ArrowLeftOnRectangleIcon, ArrowsRightLeftIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { useScaffoldConfig } from "~~/context/ScaffoldConfigContext";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { enabledChains } from "~~/services/web3/wagmiConnectors";

type IChain = {
  hasIcon: boolean;
  iconUrl?: string;
  iconBackground?: string;
  id: number;
  name?: string;
  unsupported?: boolean;
};

interface ISelectNetwork {
  chain: IChain;
}

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const SelectNetwork: React.FC<ISelectNetwork> = ({ chain }) => {
  const networkColor = useNetworkColor();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { configuredNetwork, setNetwork } = useScaffoldConfig();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="dropdown dropdown-end mr-2" ref={dropdownRef}>
        <label
          tabIndex={0}
          className={`btn btn-sm dropdown-toggle ${chain.unsupported ? "btn-error" : "btn-warning"}`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="select-network-text">
            {chain.unsupported ? "Wrong network" : chain.id !== configuredNetwork.id ? "Switch network" : chain.name}
          </span>
          <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
        </label>
        {isDropdownOpen && (
          <ul tabIndex={0} className="dropdown-content menu p-2 mt-1 shadow-lg bg-base-100 rounded-box">
            {enabledChains.map(chain => (
              <li key={chain.id}>
                <button
                  className="menu-item"
                  type="button"
                  onClick={() => {
                    switchNetwork?.(chain.id);
                    setNetwork(chain);
                    setIsDropdownOpen(false);
                  }}
                >
                  <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />
                  <span className="whitespace-nowrap">
                    Switch to <span style={{ color: networkColor }}>{chain.name}</span>
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button className="menu-item text-error" type="button" onClick={() => disconnect()}>
                <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Disconnect</span>
              </button>
            </li>
          </ul>
        )}
      </div>
    </>
  );
};
