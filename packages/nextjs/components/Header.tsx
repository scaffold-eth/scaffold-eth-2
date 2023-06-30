import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Bars3Icon, BugAntIcon, MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      passHref
      className={`${
        isActive ? "bg-secondary shadow-md" : ""
      } gap-2 rounded-full py-1.5 px-3 text-sm hover:bg-secondary hover:shadow-md focus:bg-secondary`}
    >
      {children}
    </Link>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  const navLinks = (
    <>
      <li>
        <NavLink href="/">Home</NavLink>
      </li>
      <li>
        <NavLink href="/debug">
          <BugAntIcon className="h-4 w-4" />
          Debug Contracts
        </NavLink>
      </li>
      <li>
        <NavLink href="/example-ui">
          <SparklesIcon className="h-4 w-4" />
          Example UI
        </NavLink>
      </li>
      <li>
        <NavLink href="/blockexplorer">
          <MagnifyingGlassIcon className="h-4 w-4" />
          Block Explorer
        </NavLink>
      </li>
    </>
  );

  return (
    <div className="navbar sticky top-0 z-20 min-h-0 flex-shrink-0 justify-between bg-base-100 px-0 shadow-md shadow-secondary sm:px-2 lg:static">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="dropdown lg:hidden" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`btn btn-ghost ml-1 ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              {navLinks}
            </ul>
          )}
        </div>
        <Link href="/" passHref className="ml-4 mr-6 hidden items-center gap-2 lg:flex">
          <div className="relative flex h-10 w-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Scaffold-eth</span>
            <span className="text-xs">Ethereum dev stack</span>
          </div>
        </Link>
        <ul className="menu menu-horizontal hidden gap-2 px-1 lg:flex lg:flex-nowrap">{navLinks}</ul>
      </div>
      <div className="navbar-end mr-4 flex-grow">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
