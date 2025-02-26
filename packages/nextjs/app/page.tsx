"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Pollination Station 🌸</span>
          </h1>
          <p className="text-center text-xl mt-4 max-w-2xl mx-auto">
            Your hub for DAO collaboration and cross-pollination. Connect, coordinate, and create value together.
          </p>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mt-4">
            <p className="my-2 font-medium">Connected as:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 fill-secondary" viewBox="0 0 24 24">
                <path d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9 3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3 3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3 3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.536 5.536 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13v-1.75M0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9-.28.68-.45 1.46-.45 2.4V20H0m24 0h-4v-2c0-.94-.17-1.72-.45-2.4 2.56.34 4.45 1.51 4.45 2.9V20z" />
              </svg>
              <h3 className="text-lg font-semibold mt-4">Connect DAOs</h3>
              <p className="mt-2">
                Discover and connect with like-minded DAOs. Build meaningful partnerships and expand your network.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 fill-secondary" viewBox="0 0 24 24">
                <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22S11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2S12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5M12 4.15L6.04 7.5L12 10.85L17.96 7.5L12 4.15M5 15.91L11 19.29V12.58L5 9.21V15.91M19 15.91V9.21L13 12.58V19.29L19 15.91Z" />
              </svg>
              <h3 className="text-lg font-semibold mt-4">Coordinate Resources</h3>
              <p className="mt-2">
                Share resources, align objectives, and create synergies between DAOs to maximize impact.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 fill-secondary" viewBox="0 0 24 24">
                <path d="M17.5 19L13.8 15.3C13.3 15.8 12.7 16.2 12 16.5C11.3 16.8 10.6 17 9.8 17C7.9 17 6.4 16.4 5.1 15.1C3.8 13.8 3.2 12.3 3.2 10.4C3.2 8.5 3.8 7 5.1 5.7C6.4 4.4 7.9 3.8 9.8 3.8C11.7 3.8 13.2 4.4 14.5 5.7C15.8 7 16.4 8.5 16.4 10.4C16.4 11.2 16.2 11.9 15.9 12.6C15.6 13.3 15.2 13.9 14.7 14.4L18.4 18.1L17.5 19M9.8 15C11.1 15 12.2 14.5 13.1 13.6C14 12.7 14.4 11.6 14.4 10.3C14.4 9 14 7.9 13.1 7C12.2 6.1 11.1 5.6 9.8 5.6C8.5 5.6 7.4 6.1 6.5 7C5.6 7.9 5.2 9 5.2 10.3C5.2 11.6 5.6 12.7 6.5 13.6C7.4 14.5 8.5 15 9.8 15Z" />
              </svg>
              <h3 className="text-lg font-semibold mt-4">Find Opportunities</h3>
              <p className="mt-2">
                Discover collaboration opportunities, joint initiatives, and ways to amplify your DAO's impact.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
