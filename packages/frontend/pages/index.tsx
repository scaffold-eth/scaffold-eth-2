import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import { TAutoConnect, useAutoConnect } from "~~/hooks/scaffold-eth/useAutoConnect";
import { useTempTestContract } from "~~/components/useTempTestContract";
import { Address, Balance, Faucet } from "../components/scaffold-eth";
import { useState } from "react";

// todo: move this later scaffold config.  See TAutoConnect for comments on each prop
const tempAutoConnectConfig: TAutoConnect = {
  enableBurnerWallet: true,
  autoConnect: true,
};

const Home: NextPage = () => {
  const tempTest = useTempTestContract();
  useAutoConnect(tempAutoConnectConfig);
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="px-8">
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <main className="flex items-center flex-col py-16">
        {/* Wallet connect and Faucet buttons */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 items-center justify-center">
          <ConnectButton
            key={refresh}
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            showBalance={true}
            chainStatus={{
              smallScreen: "icon",
              largeScreen: "icon",
            }}
          />
          <Faucet refresh={refresh} setRefresh={setRefresh} />
        </div>

        <h1 className="text-center my-12 text-4xl">
          Welcome to{" "}
          <a
            className="text-blue-600 hover:underline"
            href="https://github.com/scaffold-eth/se-2"
            target="_blank"
            rel="noreferrer"
          >
            scaffold-eth 2
          </a>
        </h1>

        <p className="text-center text-xl">
          Get started by editing <code className="italic bg-gray-200">packages/frontend/pages/index.tsx</code>
        </p>

        <h3 className="font-bold">Address Component</h3>
        <Address address="0xd8da6bf26964af9d7eed9e03e53415d37aa96045" />

        <p>
          <button className="btn btn-primary" onClick={() => tempTest.onClick()}>
            Daisy UI Button
          </button>
        </p>

        <h3 className="font-bold">Balance Component</h3>
        <Balance address="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" price={1350} />
      </main>
    </div>
  );
};

export default Home;
