import { Addreth, ThemeDeclaration } from "addreth";
import { AddrethProps } from "addreth/dist/Addreth";
import { useDarkMode } from "~~/hooks/scaffold-eth/useDarkMode";

const blockieSizeMap = {
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
};
interface AddrethCompProps extends Pick<AddrethProps, "theme" | "address" | "actions"> {
  size?: keyof typeof blockieSizeMap;
}

export const AddrethComp: React.FC<AddrethCompProps> = ({ theme, ...props }) => {
  const { isDarkMode } = useDarkMode();
  const customTheme: ThemeDeclaration = theme ?? {
    base: isDarkMode ? "dark" : "light",
    textColor: isDarkMode ? "#fff" : "#000",
    fontSize: blockieSizeMap[props.size ?? "base"],
    badgeBackground: isDarkMode ? "#212638" : "#93BBFB",
  };
  return <Addreth theme={customTheme} {...props} />;
};
