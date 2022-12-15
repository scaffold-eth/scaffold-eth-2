import React, { useState } from "react";
import { Faucet, NavLinks } from "~~/components/scaffold-eth";
import RainbowKitCustomConnectButton from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { Bars3Icon } from "@heroicons/react/24/outline";

/**
 * Site Drawer
 */
export default function Drawer() {
  const [isOpen, setIsOpen] = useState(Boolean);

  return (
    <div className="sm:hidden navbar bg-base-100 min-h-0 flex-shrink-0">
      <div className="navbar-start">
        <div className="dropdown">
          <button
            className="btn btn-ghost ml-1 hover:bg-secondary"
            // I'm not sure if strictmode is causing this to have inconsistent behavior?
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </button>
          {isOpen ? (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <NavLinks />
            </ul>
          ) : null}
        </div>
      </div>
      <div className="sm:hidden navbar-end mr-4">
        <RainbowKitCustomConnectButton />
        <Faucet />
      </div>
    </div>
  );
}
