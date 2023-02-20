import type { NextPage } from "next";
import { ContractUI } from "~~/components/scaffold-eth";

const Debug: NextPage = () => {
  return (
    <>
      <div className="flex justify-center">
        <ContractUI contractName="YourContract" />
      </div>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Debug Contracts</h1>
        <p className="text-neutral">
          You can debug & interact with your deployed contracts here.
          <br /> Check{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            packages / nextjs / pages / debug.tsx
          </code>{" "}
        </p>
      </div>
    </>
  );
};

export default Debug;
