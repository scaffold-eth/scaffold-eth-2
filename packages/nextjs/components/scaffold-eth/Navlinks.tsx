import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <Link href={href} passHref>
      <a
        onClick={() => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }}
        className={`${router.pathname === href ? "bg-secondary" : ""} hover:bg-secondary focus:bg-secondary py-4 gap-2`}
      >
        {children}
      </a>
    </Link>
  );
};

/**
 * Site Drawer
 */
export default function NavLinks() {
  return (
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
    </>
  );
}
