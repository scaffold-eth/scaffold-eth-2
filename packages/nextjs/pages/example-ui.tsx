import type { NextPage } from "next";
import { ContractData } from "~~/components/ExampleUi/ContractData";
import { ContractInteraction } from "~~/components/ExampleUi/ContractInteraction";

const ExampleUI: NextPage = () => {
  return (
    <div className="grid grid-cols-2 flex-grow" data-theme="exampleUi">
      <ContractInteraction />
      <ContractData />
    </div>
  );
};

export default ExampleUI;
