import type { NextPage } from "next";
import Head from "next/head";
import { useAppStore } from "~~/services/store/store";
import { Address, AddressInput, Balance } from "../components/scaffold-eth";
import { useEffect } from "react";
import Link from "next/link";
import { ReadOnlyFunctionForm } from "../components/scaffold-eth/Contract/ReadOnlyFunctionForm";
import { FunctionFragment } from "ethers/lib/utils";

const Home: NextPage = () => {
  const tempState = useAppStore(state => state.tempSlice.tempState);

  useEffect(() => {
    console.log("test state, in index.tsx:", tempState?.tempStuff);
  }, [tempState?.tempStuff]);

  return (
    <div className="px-8">
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <main className="flex items-center flex-col py-16">
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

        <Link href={"/debug"}>
          <button className="mt-4 btn btn-primary">Got to contract component</button>
        </Link>

        <h3 className="font-bold mt-8">Address Component</h3>
        <Address address="0xd8da6bf26964af9d7eed9e03e53415d37aa96045" />

        <h3 className="font-bold mt-8">Balance Component</h3>
        <Balance address="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" />

        <h3 className="font-bold mt-8">Address Input Component</h3>
        <AddressInput placeholder="Enter address" />
        <h3 className="font-bold mt-8">Read Only Function Form</h3>
        <ReadOnlyFunctionForm
          functionFragment={FunctionFragment["setups"]}
          contractAddress="0x5FbDB2315678afecb367f032d93F642f64180aa3"
        />
      </main>
    </div>
  );
};

export default Home;
