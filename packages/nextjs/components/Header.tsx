import Link from "next/link";
import Image from "next/image";
import { Faucet } from "~~/components/scaffold-eth";
import RainbowKitCustomConnectButton from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";

/**
 * Site header
 */
export default function Header() {
  return (
    <div className="navbar bg-base-100 min-h-0">
      <div className="navbar-start">
        <div className="flex items-center	gap-2 mx-4">
          <Link href="/">
            <Image alt="scaffold-eth logo" className="cursor-pointer" width="40px" height="40px" src="/logo.svg" />
          </Link>
          <div className="flex flex-col">
            <span className="font-bold">Scaffold-eth</span>
            <span className="text-xs">Forkable Ethereum dev stack</span>
          </div>
        </div>
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/" passHref>
              <a className="hover:bg-secondary focus:bg-secondary py-5">Home</a>
            </Link>
          </li>
          <li>
            <Link href="/debug" passHref>
              <a className="hover:bg-secondary focus:bg-secondary">Debug Contracts</a>
            </Link>
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
