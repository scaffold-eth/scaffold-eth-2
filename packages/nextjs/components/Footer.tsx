import React from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useAppStore } from "~~/services/store/store";
import { HeartIcon } from "@heroicons/react/24/outline";
import SwitchTheme from "./SwitchTheme";
import { Faucet } from "./scaffold-eth";

/**
 * Site footer
 */
export default function Footer() {
  const ethPrice = useAppStore(state => state.ethPrice);

  return (
    <div className="min-h-0 p-5 flex justify-between items-center flex-col sm:flex-row gap-4">
      <div>
        <div className="flex space-x-2 fixed z-10 m-4 bottom-0 left-0">
          {ethPrice > 0 && (
            <div className="btn btn-primary btn-sm font-normal cursor-auto">
              <CurrencyDollarIcon className="h-4 w-4 mr-0.5" />
              <span>{ethPrice}</span>
            </div>
          )}
          <Faucet />
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
      <div className="mr-4 text-sm">
        <div className="fixed z-10 m-4 bottom-0 right-0">
          <SwitchTheme />
        </div>
      </div>
    </div>
  );
}
