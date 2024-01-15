"use client";

import { Addreth, ThemeDeclaration } from "addreth";
import { AddrethProps } from "addreth/dist/Addreth";
import { useDarkMode } from "~~/hooks/scaffold-eth/useDarkMode";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

const blockieSizeMap = {
  xs: 9,
  sm: 11,
  base: 13,
  lg: 14,
  xl: 15,
  "2xl": 17,
  "3xl": 12,
};

// Pick<AddrethProps, "theme" | "address" | "actions">
interface AddrethCompProps extends AddrethProps {
  size?: keyof typeof blockieSizeMap;
}

export const AddrethComp: React.FC<AddrethCompProps> = ({ theme, ...props }) => {
  const { isDarkMode } = useDarkMode();
  const { targetNetwork } = useTargetNetwork();

  // Skeleton UI
  if (!props.address) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(targetNetwork, props.address);
  const customTheme: ThemeDeclaration = theme ?? {
    base: isDarkMode ? "dark" : "light",
    textColor: isDarkMode ? "#fff" : "#000",
    fontSize: blockieSizeMap[props.size ?? "base"],
    badgeBackground: isDarkMode ? "#2A3655" : "#93BBFB",
  };
  return (
    <Addreth
      explorer={() => ({
        name: targetNetwork.name,
        accountUrl: blockExplorerAddressLink,
      })}
      theme={customTheme}
      {...props}
    />
  );
};
