import type { Metadata, NextPage } from "next";
import { ContractData } from "~~/components/example-ui/ContractData";
import { ContractInteraction } from "~~/components/example-ui/ContractInteraction";
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
