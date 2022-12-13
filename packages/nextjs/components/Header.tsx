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
        className={`${router.pathname === href ? "bg-secondary" : ""} hover:bg-secondary focus:bg-secondary py-5 gap-2`}
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
    <div className="navbar bg-base-100 min-h-0">
      <div className="navbar-start">
        <div className="flex items-center	gap-2 mx-4">
          <Link href="/" passHref>
            <a>
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

      <div className="navbar-end mr-4">
        <RainbowKitCustomConnectButton />
        <Faucet />
      </div>
    </div>
  );
}
