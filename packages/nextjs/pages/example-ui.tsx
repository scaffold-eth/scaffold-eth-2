import type { NextPage } from "next";
import Head from "next/head";
import { ContractData } from "~~/components/ExampleUi/ContractData";
import { ContractInteraction } from "~~/components/ExampleUi/ContractInteraction";

import { Bai_Jamjuree } from "@next/font/google";

const baiJamjuree = Bai_Jamjuree({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bai-jamjuree",
});

const ExampleUI: NextPage = () => {
  return (
    <>
      <Head>
        <title>Scaffold-eth Example Ui</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>
      <div className={`grid lg:grid-cols-2 flex-grow ${baiJamjuree.variable}`} data-theme="exampleUi">
        <ContractInteraction />
        <ContractData />
      </div>
    </>
  );
};

export default ExampleUI;
