//SwitchTheme.tsx
import React, { useEffect } from "react";
import { useDarkMode } from "usehooks-ts";
import { SunIcon } from "@heroicons/react/24/outline";
const SwitchTheme = () => {
  const { isDarkMode, toggle } = useDarkMode(false);

  useEffect(() => {
    const body = document.body;
    body.setAttribute("data-theme", isDarkMode ? "scaffoldEthDark" : "scaffoldEth");
  }, [isDarkMode]);

  return (
    <div className="flex space-x-2">
      <input type="checkbox" className="toggle toggle-primary bg-primary" onChange={toggle} checked={isDarkMode} />
      <SunIcon className="swap-off h-6 w-6" />
    </div>
  );
};
export default SwitchTheme;
