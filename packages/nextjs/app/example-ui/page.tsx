import { ContractData } from "./_components/ContractData";
import { ContractInteraction } from "./_components/ContractInteraction";
import type { Metadata, NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
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
