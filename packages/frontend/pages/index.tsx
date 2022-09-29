import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import Address from "../components/scaffold-eth/Address";

const Home: NextPage = () => {
  return (
    <div className="px-8">
      <Head>
        <title>Scaffod-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <main className="flex items-center flex-col py-16">
        <ConnectButton />

        <h1 className="text-center my-12 text-4xl">
          Welcome to{" "}
          <a
            className="text-blue-600 hover:underline"
            href="https://github.com/scaffold-eth/se-2"
            target="_blank"
            rel="noreferrer">
            scaffold-eth 2
          </a>
        </h1>

        <p className="text-center text-xl">
          Get started by editing <code className="italic bg-gray-200">packages/frontend/pages/index.tsx</code>
        </p>

        <h3 className="font-bold">Address Component</h3>
        <Address address="0xd8da6bf26964af9d7eed9e03e53415d37aa96045" />

        <p>
          <button className="btn btn-primary">Daisy UI Button</button>
        </p>
      </main>
    </div>
  );
};

export default Home;
