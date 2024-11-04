"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDarkMode = resolvedTheme === "light";

  const handleToggle = () => {
    if (isDarkMode) {
      setTheme("light");
      return;
    }
    setTheme("dark");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`text-sm ${className}`}>
      <label className="swap btn btn-sm btn-outline btn-primary">
        <input id="theme-toggle" type="checkbox" onChange={handleToggle} checked={isDarkMode} />
        <div className="swap-on">
          Light / <span className="font-[900]">Dark</span>
        </div>
        <div className="swap-off">
          <span className="font-[900]">Light</span> / Dark
        </div>
      </label>
    </div>
  );
};
