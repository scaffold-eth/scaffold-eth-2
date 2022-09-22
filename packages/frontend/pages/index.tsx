import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <div className="px-8">
      <Head>
        <title>Scaffod-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex items-center flex-col py-16">
        <ConnectButton />

        <h1 className="text-center my-12 text-4xl">
          Welcome to{" "}
          <a
            className="text-blue-600 hover:underline"
            href="https://github.com/scaffold-eth/scaffold-eth"
            target="_blank"
          >
            scaffold-eth
          </a>
        </h1>

        <p className="text-center text-xl">
          Get started by editing{" "}
          <code className="italic bg-gray-200">
            packages/frontend/pages/index.tsx
          </code>
        </p>
      </main>
    </div>
  );
};

export default Home;
