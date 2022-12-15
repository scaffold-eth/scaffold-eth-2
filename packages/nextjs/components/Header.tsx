import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Faucet, Drawer, NavLinks } from "~~/components/scaffold-eth";
import RainbowKitCustomConnectButton from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";

/**
 * Site header
 */
export default function Header() {
  return (
    <>
      <div className="navbar bg-base-100 min-h-0 flex-shrink-0">
        <div className="hidden sm:flex navbar-start">
          <div className="flex items-center	gap-2 mx-4">
            <Link href="/" passHref>
              <a className="flex">
                <Image alt="scaffold-eth logo" className="cursor-pointer" width="40px" height="40px" src="/logo.svg" />
              </a>
            </Link>
            <div className="flex flex-col">
              <span className="font-bold">Scaffold-eth</span>
              <span className="text-xs">Forkable Ethereum dev stack</span>
            </div>
          </div>
          <ul className="menu menu-horizontal px-1">
            <NavLinks />
          </ul>
        </div>
        <div className="hidden sm:flex navbar-end mr-4">
          <RainbowKitCustomConnectButton />
          <Faucet />
        </div>
      </div>
      <Drawer />
    </>
  );
}
