import type { NextPage } from "next";
import { ContractUI } from "~~/components/scaffold-eth";

const Debug: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl text-white my-5">Debug Contract</h1>
      <ContractUI contractName="FarmMainRegularMinStakeABI" />
    </div>
  );
};

export default Debug;
