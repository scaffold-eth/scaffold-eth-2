"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dropdown, DropdownItem } from "./Dropdown";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

const getHeaderMenuLinks = (pathname: string) => {
  return menuLinks.map(({ label, href, icon }) => {
    const isActive = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={`${
          isActive ? "bg-secondary shadow-md" : ""
        } hover:bg-secondary hover:shadow-md w-full text-nowrap focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 flex items-center`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  });
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const pathname = usePathname();

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <Dropdown
          triggerContent={<Bars3Icon className="h-6 w-6 hover:bg-transparent" />}
          triggerClassName="rounded-md p-1"
          className="lg:hidden"
          hideChevron
        >
          {getHeaderMenuLinks(pathname).map((headerMenuLink, idx) => (
            <DropdownItem key={idx}>{headerMenuLink}</DropdownItem>
          ))}
        </Dropdown>

        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Scaffold-ETH</span>
            <span className="text-xs">Ethereum dev stack</span>
          </div>
        </Link>
        <div className="hidden lg:flex lg:flex-nowrap px-1 gap-2">{getHeaderMenuLinks(pathname)}</div>
      </div>
      <div className="navbar-end grow mr-4 gap-1">
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
