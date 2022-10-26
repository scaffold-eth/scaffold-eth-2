import type { NextPage } from "next";
import Contract from "~~/components/scaffold-eth/Contract";

const Debug: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl text-white my-5">Debug Contract</h1>
      <Contract contractName="YourContract" />
    </div>
  );
};

export default Debug;
