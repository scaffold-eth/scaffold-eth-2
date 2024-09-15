import { NetworkOptions } from "./NetworkOptions";
import { ChevronDown, LogOut } from "lucide-react";
import { useDisconnect } from "wagmi";
import { Button } from "~~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "~~/components/ui/dropdown-menu";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="destructive" size="sm" className="mr-2">
          Wrong network
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <NetworkOptions />
        <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => disconnect()}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
