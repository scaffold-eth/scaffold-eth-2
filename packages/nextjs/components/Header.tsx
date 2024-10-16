"use client";

import { ReactNode, forwardRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: ReactNode;
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

type MenuLinkProps = HeaderMenuLink & {
  isActive: boolean;
};

const MenuLink = forwardRef<HTMLAnchorElement, MenuLinkProps>(({ href, label, icon, isActive }, ref) => (
  <Link
    href={href}
    passHref
    ref={ref}
    className={`${
      isActive ? "bg-secondary shadow-md" : ""
    } hover:bg-secondary hover:shadow-md  py-1.5 px-3 text-sm rounded-md grid grid-flow-col`}
  >
    {icon}
    <span>{label}</span>
  </Link>
));

MenuLink.displayName = "MenuLink";

export const HeaderMenuLinks = ({ withDropDownMenu }: { withDropDownMenu?: boolean }) => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;

        return withDropDownMenu ? (
          <DropdownMenuItem key={href} asChild>
            <MenuLink key={href} href={href} label={label} icon={icon} isActive={isActive} />
          </DropdownMenuItem>
        ) : (
          <MenuLink key={href} href={href} label={label} icon={icon} isActive={isActive} />
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  return (
    <div className="sticky lg:static top-0 flex items-center p-2 bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="inline-flex items-start w-auto lg:w-1/2">
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <label tabIndex={0} className={`ml-1 btn btn-ghost`}>
                <Bars3Icon className="h-1/2" />
              </label>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="m-3 p-2 shadow bg-base-100 rounded-box w-52">
              <HeaderMenuLinks withDropDownMenu />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Scaffold-ETH</span>
            <span className="text-xs">Ethereum dev stack</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="inline-flex justify-end w-1/2 flex-grow mr-4 space-x-1">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
