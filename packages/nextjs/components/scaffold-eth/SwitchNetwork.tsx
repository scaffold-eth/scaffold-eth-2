import { useDisconnect, useSwitchNetwork } from "wagmi";
import { ArrowLeftOnRectangleIcon, ArrowsRightLeftIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { useScaffoldConfig } from "~~/context/ScaffoldConfigContext";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

export const SwitchNetwork = () => {
  const networkColor = useNetworkColor();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();
  const { setNetwork } = useScaffoldConfig();

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
          <li>
            <button
              className="btn-sm !rounded-xl flex py-3 gap-3"
              type="button"
              onClick={() => {
                switchNetwork?.(getTargetNetwork().id);
                setNetwork(getTargetNetwork());
              }}
            >
              <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <span className="whitespace-nowrap">
                Switch to <span style={{ color: networkColor }}>{getTargetNetwork().name}</span>
              </span>
            </button>
          </li>
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
    </>
  );
};
