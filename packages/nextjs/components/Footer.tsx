import React from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useAppStore } from "~~/services/store/store";

/**
 * Site footer
 */
export default function Footer() {
  const ethPrice = useAppStore(state => state.ethPriceSlice.ethPrice);

  return (
    <div className="navbar bg-secondary min-h-0 p-4">
      <div className="navbar-start">
        {ethPrice > 0 && (
          <div className="btn btn-primary btn-sm font-normal cursor-auto">
            <CurrencyDollarIcon className="text-black h-4 w-4 mr-0.5" />
            <span>{ethPrice}</span>
          </div>
        )}
      </div>
      <div className="navbar-middle">
        <ul className="menu menu-horizontal px-1">
          <div className="flex items-center gap-4">
            <div>
              <a href="https://github.com/scaffold-eth/se-2" target="_blank" rel="noreferrer">
                Fork Me
              </a>
            </div>
            <div>
              Built with 💖 at 🏰{" "}
              <a href="https://buidlguidl.com/" target="_blank" rel="noreferrer">
                BuidlGuidl
              </a>
            </div>
            <div>
              <a href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA" target="_blank" rel="noreferrer">
                Support
              </a>
            </div>
          </div>
        </ul>
      </div>
      <div className="navbar-end mr-4">
        <div>Color Switch Placeholder</div>
      </div>
    </div>
  );
}
