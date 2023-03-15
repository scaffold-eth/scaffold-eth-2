import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const {
    writeAsync: setGreetingTx,
    isLoading,
    isMining,
  } = useScaffoldContractWrite("YourContract", "setGreeting", ["Hello!"]);

  return (
    <>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>
      <div className="flex items-center flex-col flex-grow pt-10">
        <button className={`btn btn-primary ${isLoading ? "loading" : ""}`} onClick={setGreetingTx}>
          Set Greeting!
        </button>
        <br />
        Is Write Mining: {isMining.toString()}
      </div>
    </>
  );
};

export default Home;
