"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  BarChart,
  BuildingIcon,
  DollarSignIcon,
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Search,
  ShoppingCart,
  Users2,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { BugAntIcon } from "@heroicons/react/24/outline";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~~/components/ui/breadcrumb";
import { Button } from "~~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";
import { Input } from "~~/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "~~/components/ui/sheet";
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
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
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
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
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
export const Header = () => {
  const [, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  // Get current page
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className={`${
                pathname === "/" ? "text-foreground" : ""
              } group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base`}
            >
              <BuildingIcon className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Acme Inc</span>
            </Link>
            <Link
              href="#"
              className={`${
                pathname === "/" ? "text-foreground" : "text-muted-foreground"
              } flex items-center gap-4 px-2.5  hover:text-foreground`}
            >
              <Home className="h-5 w-5" />
              Home
            </Link>
            <Link
              href="/fundraising"
              className={`${
                pathname === "/fundraising" ? "text-foreground" : "text-muted-foreground"
              } flex items-center gap-4 px-2.5  hover:text-foreground`}
            >
              <DollarSignIcon className="h-5 w-5" />
              Fundraising
            </Link>
            <Link
              href="/holdings"
              className={`${
                pathname === "/holdings" ? "text-foreground" : "text-muted-foreground"
              } flex items-center gap-4 px-2.5  hover:text-foreground`}
            >
              <WalletIcon className="h-5 w-5" />
              Holdings
            </Link>
            <Link
              href="/payroll"
              className={`${
                pathname === "/payroll" ? "text-foreground" : "text-muted-foreground"
              } flex items-center gap-4 px-2.5  hover:text-foreground`}
            >
              <UsersIcon className="h-5 w-5" />
              Payroll
            </Link>
            <Link
              href="#"
              className={`${
                pathname === "/settings" ? "text-foreground" : "text-muted-foreground"
              } flex items-center gap-4 px-2.5  hover:text-foreground`}
            >
              <LineChart className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
        <Badge variant="outline">Founder</Badge>
      <Breadcrumb></Breadcrumb>
      <div className="w-full flex items-center justify-end">
        <div className="relative ml-auto flex-1 md:grow-0">
          <ConnectButton></ConnectButton>
        </div>
      </div>
    </header>
  );
};
