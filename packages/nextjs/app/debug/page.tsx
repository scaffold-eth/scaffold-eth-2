import DebugContractsComponents from "../../components/debug/debugContractsComponent";
import type { Metadata, NextPage } from "next";

export const metadata: Metadata = {
  title: "Debug Contract",
  description: "Debug your deployed 🏗 Scaffold-ETH 2 contracts in an easy way",
  openGraph: {
    title: "Debug Contract",
    description: "Debug your deployed 🏗 Scaffold-ETH 2 contracts in an easy way",
  },
  twitter: {
    title: "Debug Contract",
    description: "Debug your deployed 🏗 Scaffold-ETH 2 contracts in an easy way",
  },
};

const Debug: NextPage = () => {
  return (
    <>
      <DebugContractsComponents />
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
