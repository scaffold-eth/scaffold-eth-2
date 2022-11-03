import type { NextPage } from "next";
import Head from "next/head";
import { useTempTestContract } from "~~/components/useTempTestContract";
import { useAppStore } from "~~/services/store/store";
import { Address, AddressInput, Balance } from "../components/scaffold-eth";
import { useEffect } from "react";

const Home: NextPage = () => {
  const tempTest = useTempTestContract();

  const tempState = useAppStore(state => state.tempSlice.tempState);

  useEffect(() => {
    console.log("test state, in index.tsx:  " + tempState?.tempStuff);
  }, [tempState?.tempStuff]);

  return (
    <div className="px-8">
      <Head>
        <title>Scaffold-EthOs Starter Kit</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <main className="flex items-center flex-col py-16">
        <h1 className="text-center my-12 text-4xl">
          Welcome to the{" "}
          <a className="text-blue-600 hover:underline" href="https://ethOs.eth.limo" target="_blank" rel="noreferrer">
            Scaffold-EthOs Starter Kit
          </a>
          <div>a developer kit to build with EthereansOs</div>
        </h1>
      </main>
    </div>
  );
};

export default Home;
