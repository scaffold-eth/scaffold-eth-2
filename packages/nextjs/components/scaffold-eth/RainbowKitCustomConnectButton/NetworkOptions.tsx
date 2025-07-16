import { useTheme } from "next-themes";
import { useAccount, useSwitchChain } from "wagmi";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import { DropdownItem } from "~~/components/Dropdown";
import { getNetworkColor } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

export const NetworkOptions = () => {
  const { switchChain } = useSwitchChain();
  const { chain } = useAccount();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <>
      {allowedNetworks
        .filter(allowedNetwork => allowedNetwork.id !== chain?.id)
        .map(allowedNetwork => (
          <DropdownItem
            key={allowedNetwork.id}
            className={`h-8 rounded-xl! flex gap-3 hover:bg-primary-content/10 py-1.5 px-3 cursor-pointer`}
            onClick={() => {
              switchChain?.({ chainId: allowedNetwork.id });
            }}
          >
            <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />
            <span>
              Switch to{" "}
              <span
                style={{
                  color: getNetworkColor(allowedNetwork, isDarkMode),
                }}
              >
                {allowedNetwork.name}
              </span>
            </span>
          </DropdownItem>
        ))}
    </>
  );
};
