import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { Dropdown, DropdownItem } from "~~/components/Dropdown";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <Dropdown
      align="right"
      className="bg-secondary rounded-full"
      triggerClassName="rounded-full h-7.5 bg-error hover:bg-error pl-3 text-black"
      triggerContent={<span>Wrong network</span>}
    >
      <NetworkOptions />
      <DropdownItem
        className="h-8 rounded-xl! flex gap-3 hover:bg-primary-content/10 py-1.5 px-3 cursor-pointer text-error"
        onClick={() => disconnect()}
      >
        <>
          <ArrowLeftEndOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />
          <span>Disconnect</span>
        </>
      </DropdownItem>
    </Dropdown>
  );
};
