import { ContractData } from "./_components/ContractData";
import { ContractInteraction } from "./_components/ContractInteraction";
import type { Metadata, NextPage } from "next";
import { getMetaData } from "~~/utils/scaffold-eth/getMetaData";

export const metadata: Metadata = getMetaData({
  title: "Example UI",
  description: "Example UI created with 🏗 Scaffold-ETH 2, showcasing some of its features.",
});

const ExampleUI: NextPage = () => {
  return (
    <>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">
        <ContractInteraction />
        <ContractData />
      </div>
    </>
  );
};

export default ExampleUI;
