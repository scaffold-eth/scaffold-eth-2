import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "My Collection",
  description: "My Collection",
});

const Collection: NextPage = () => {
  return (
    <>
      {/*<DebugContracts />*/}
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">My Prints</h1>
        <p className="text-neutral"></p>
      </div>
    </>
  );
};

export default Collection;
