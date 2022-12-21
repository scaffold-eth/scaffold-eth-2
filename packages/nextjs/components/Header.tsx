import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Faucet } from "~~/components/scaffold-eth";
import RainbowKitCustomConnectButton from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { Bars3Icon, BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

const menuItems = [
  {
    label: "Home",
    link: "/",
    icon: null,
  },
  {
    label: "Debug Contracts",
    link: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
  {
    label: "Example UI",
    link: "/example-ui",
    icon: <SparklesIcon className="h-4 w-4" />,
  },
];

const NavLink = ({
  href,
  children,
  setIsOpen,
}: {
  href: string;
  children: React.ReactNode;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();

  return (
    <Link href={href} passHref>
      <a
        onClick={() => {
          setIsOpen(false);
        }}
        className={`${router.pathname === href ? "bg-secondary" : ""} hover:bg-secondary focus:bg-secondary py-4 gap-2`}
      >
        {children}
      </a>
    </Link>
  );
};

const NavLinks = ({ setIsOpen }: { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <>
      {menuItems.map((item, index) => {
        return (
          <li key={index}>
            <NavLink href={item.link} setIsOpen={setIsOpen}>
              {item.icon}
              {item.label}
            </NavLink>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsOpen(false), []),
  );

  return (
    <div className="navbar bg-base-100 min-h-0 flex-shrink-0 justify-between">
      <div className="navbar-start w-auto sm:w-1/2 ">
        <div className="sm:hidden dropdown" ref={burgerMenuRef}>
          <button
            className={`ml-1 btn btn-ghost ${isOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </button>
          {isOpen ? (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <NavLinks setIsOpen={setIsOpen} />
            </ul>
          ) : null}
        </div>
        <div className="hidden sm:flex items-center	gap-2 mx-4">
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
        <ul className="hidden sm:flex sm:flex-wrap lg:flex-nowrap menu menu-horizontal px-1">
          <NavLinks setIsOpen={setIsOpen} />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        <Faucet />
      </div>
    </div>
  );
}
