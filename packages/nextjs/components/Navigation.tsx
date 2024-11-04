"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BugAntIcon, HomeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <HomeIcon className="h-8 w-8 rounded-full border-primary border p-1" />,
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-8 w-8 rounded-full border-primary border p-1" />,
  },
  {
    label: "Block Explorer",
    href: "/blockexplorer",
    icon: <MagnifyingGlassIcon className="h-8 w-8 rounded-full border-primary border p-1" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary/50" : ""
              } hover:bg-secondary focus:!bg-secondary/50 focus:!text-primary active:!bg-secondary p-4 text-base font-[620] grid grid-flow-col rounded-none`}
            >
              <div className=" items-center">{icon}</div>
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Navigation = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <>
      <div className="lg:hidden dropdown border-r border-base-300 font-right-serif" ref={burgerMenuRef}>
        <label
          tabIndex={0}
          className={`m-2 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
          onClick={() => {
            setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
          }}
        >
          <Bars3Icon className="h-6 w-6" />
        </label>
        {isDrawerOpen && (
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content border-2 border-secondary ml-12 -mt-12 bg-base-200 rounded-none w-60 z-10"
            onClick={() => {
              setIsDrawerOpen(false);
            }}
          >
            <HeaderMenuLinks />
          </ul>
        )}
      </div>

      <div className="min-h-full hidden lg:block border-r border-base-300">
        <ul className="menu min-w-56 p-0 font-right-serif text-primary">
          <HeaderMenuLinks />
        </ul>
      </div>
    </>
  );
};
