import { useDarkMode } from "usehooks-ts";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import { ArrowLeftOnRectangleIcon, ArrowsRightLeftIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { getNetworkColor } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

export const SwitchNetwork = () => {
  const { isDarkMode } = useDarkMode();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();

  return (
    <>
      <div className="dropdown dropdown-end mr-2">
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
                <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />
                <span>
                  Switch to{" "}
                  <span
                    style={{
                      color: getNetworkColor(network, isDarkMode),
                    }}
                  >
                    {network.name}
                  </span>
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
              <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <span>Disconnect</span>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};
