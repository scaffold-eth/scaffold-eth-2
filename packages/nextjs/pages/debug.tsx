import type { NextPage } from "next";
import { ContractUI } from "~~/components/scaffold-eth";

const Debug: NextPage = () => {
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-6 py-12 px-10 lg:gap-12 w-full max-w-7xl my-0">
        <ContractUI contractName="YourContract" />
      </div>
    </div>
  );
};

export default Debug;
