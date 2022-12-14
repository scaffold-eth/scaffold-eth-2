import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { Faucet } from "~~/components/scaffold-eth";
import RainbowKitCustomConnectButton from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <Link href={href} passHref>
      <a
        className={`${router.pathname === href ? "bg-secondary" : ""} hover:bg-secondary focus:bg-secondary py-4 gap-2`}
      >
        {children}
      </a>
    </Link>
  );
};

/**
 * Site header
 */
export default function Header() {
  return (
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
        </ul>
      </div>
      <div className="navbar bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <NavLink href="/debug">
                  <BugAntIcon className="h-4 w-4" />
                  Debug Contracts
                </NavLink>
                <NavLink href="/example-ui">
                  <SparklesIcon className="h-4 w-4" />
                  Example UI
                </NavLink>
              </li>
            </ul>
          </div>
          {/* Maybe we want a scaffold-eth link in navbar besides hamburg menu */}
          {/*  <Link href="/" className="sm:hidden btn btn-ghost text-sm">
            Scaffold-eth
          </Link> */}
        </div>
      </div>

      <div className="navbar-end mr-4">
        <RainbowKitCustomConnectButton />
        <Faucet />
      </div>
    </div>
  );
}
