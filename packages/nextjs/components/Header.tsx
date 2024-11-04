"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

/**
 * Site header
 */
export const Header = () => {
  return (
    <div className="sticky lg:static top-0 border-b border-base-300 bg-base-200 navbar min-w-[900px] min-h-0 flex-shrink-0 justify-between z-20 px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <Link href="/" passHref className="flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex text-primary">
            <span className="text-xs font-bold leading-tight pr-2">Scaffold-ETH</span>
            <span className="text-xs text-primary/30">Ethereum dev stack</span>
          </div>
        </Link>
      </div>
      <div className="navbar-end flex-grow pr-2">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
