import React from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useAppStore } from "~~/services/store/store";
import { HeartIcon } from "@heroicons/react/24/outline";
import SwitchTheme from "./SwitchTheme";

/**
 * Site footer
 */
export default function Footer() {
  const ethPrice = useAppStore(state => state.ethPriceSlice.ethPrice);

  return (
    <div className="min-h-0 p-5 flex justify-between items-center flex-col sm:flex-row gap-4">
      <div className="flex w-full sm:w-auto items-center justify-between mx-4">
        {ethPrice > 0 && (
          <div className="btn btn-primary btn-sm font-normal cursor-auto">
            <CurrencyDollarIcon className="h-4 w-4 mr-0.5" />
            <span>{ethPrice}</span>
          </div>
        )}
        <div className="sm:hidden text-sm">
          <SwitchTheme key="xs" />
        </div>
      </div>

      <div>
        <ul className="menu menu-horizontal px-1">
          <div className="flex items-center gap-2 text-sm">
            <div>
              <a
                href="https://github.com/scaffold-eth/se-2"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Fork me
              </a>
            </div>
            <span>·</span>
            <div>
              Built with <HeartIcon className="inline-block h-4 w-4" /> at 🏰{" "}
              <a
                href="https://buidlguidl.com/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                BuidlGuidl
              </a>
            </div>
            <span>·</span>
            <div>
              <a
                href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Support
              </a>
            </div>
          </div>
        </ul>
      </div>

      <div className="hidden sm:block mx-4 text-sm">
        <SwitchTheme key="sm" />
      </div>
    </div>
  );
}
