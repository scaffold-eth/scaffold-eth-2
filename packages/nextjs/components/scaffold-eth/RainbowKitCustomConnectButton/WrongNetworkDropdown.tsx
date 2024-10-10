import { NetworkOptions } from "./NetworkOptions";
import { ChevronDown } from "lucide-react";
import { useDisconnect } from "wagmi";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { Button } from "~~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="destructive" size="sm">
          Wrong network
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <NetworkOptions />
        <DropdownMenuItem asChild>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => disconnect()}>
            <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
